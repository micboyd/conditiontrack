import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addDays, addMonths, addWeeks, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TrainingBlock } from '../../training-blocks/models/TrainingBlock';
import { TrainingBlocksService } from '../../training-blocks/training-blocks.service';
import { WeekPlan } from '../models/WeekPlan';
import { WeekTemplate } from '../models/WeekTemplate';
import { WeekPlannerService } from '../week-planner.service';
import { WeekTemplateService } from '../week-template.service';

interface WeekRow {
	weekStart: string;
	label: string;
	plan: WeekPlan | null;
	applying: boolean;
	removing: boolean;
	applyError: boolean;
	clearConfirming: boolean;
	clearing: boolean;
}

interface MonthBlock {
	label: string;
	weeks: WeekRow[];
}

@Component({
	selector: 'app-week-schedule',
	templateUrl: './week-schedule.component.html',
	standalone: false,
})
export class WeekScheduleComponent implements OnInit {
	loading = false;
	monthsLoading = false;
	loadError = false;
	months: MonthBlock[] = [];
	templates: WeekTemplate[] = [];
	trainingBlocks: TrainingBlock[] = [];
	selectedTemplateId = '';
	monthOffset = 0;

	private readonly currentMonthStart: Date;
	readonly currentWeekStart: string;

	constructor(
		private route: ActivatedRoute,
		private weekPlannerService: WeekPlannerService,
		private weekTemplateService: WeekTemplateService,
		private trainingBlocksService: TrainingBlocksService,
	) {
		this.currentMonthStart = startOfMonth(new Date());
		this.currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
	}

	get selectedTemplateName(): string {
		return this.templates.find(t => t._id === this.selectedTemplateId)?.name ?? '';
	}

	get canGoBack(): boolean {
		return this.monthOffset > 0;
	}

	get rangeLabel(): string {
		const start = addMonths(this.currentMonthStart, this.monthOffset * 3);
		const end = addMonths(start, 2);
		if (format(start, 'yyyy') === format(end, 'yyyy')) {
			return `${format(start, 'MMM')} – ${format(end, 'MMM yyyy')}`;
		}
		return `${format(start, 'MMM yyyy')} – ${format(end, 'MMM yyyy')}`;
	}

	ngOnInit() {
		this.loading = true;

		forkJoin({
			templates: this.weekTemplateService.getTemplates(localStorage.getItem('id') ?? ''),
			blocks: this.trainingBlocksService.getAllBlocks(),
		}).subscribe({
			next: ({ templates, blocks }) => {
				this.templates = templates.map(t => new WeekTemplate(t));
				this.trainingBlocks = blocks.map(b => new TrainingBlock(b));
				const templateId = this.route.snapshot.queryParamMap.get('templateId');
				if (templateId && this.templates.some(t => t._id === templateId)) {
					this.selectedTemplateId = templateId;
				}
				this.loadMonths();
			},
			error: () => {
				this.loading = false;
				this.loadError = true;
			},
		});
	}

	prevMonths() {
		if (!this.canGoBack) return;
		this.monthOffset--;
		this.loadMonths();
	}

	nextMonths() {
		this.monthOffset++;
		this.loadMonths();
	}

	goToCurrentMonths() {
		this.monthOffset = 0;
		this.loadMonths();
	}

	private loadMonths() {
		this.monthsLoading = true;
		const userId = localStorage.getItem('id') ?? '';
		const startMonth = addMonths(this.currentMonthStart, this.monthOffset * 3);

		const labels: string[] = [];
		const allWeekStarts: string[] = [];
		const monthWeekMap: string[][] = [];

		for (let m = 0; m < 3; m++) {
			const month = addMonths(startMonth, m);
			labels.push(format(month, 'MMMM yyyy'));
			const weekStarts: string[] = [];

			let current = startOfWeek(month, { weekStartsOn: 1 });
			if (!isSameMonth(current, month)) {
				current = addWeeks(current, 1);
			}
			while (isSameMonth(current, month)) {
				const ws = format(current, 'yyyy-MM-dd');
				weekStarts.push(ws);
				allWeekStarts.push(ws);
				current = addWeeks(current, 1);
			}
			monthWeekMap.push(weekStarts);
		}

		if (allWeekStarts.length === 0) {
			this.months = labels.map((label) => ({ label, weeks: [] as WeekRow[] }));
			this.monthsLoading = false;
			return;
		}

		const weekPlan$ = allWeekStarts.map(ws =>
			this.weekPlannerService.getWeekPlanByWeek(userId, ws).pipe(catchError(() => of(null))),
		);

		forkJoin(weekPlan$).subscribe({
			next: weekPlans => {
				const planMap = new Map<string, WeekPlan | null>();
				allWeekStarts.forEach((ws, i) => planMap.set(ws, weekPlans[i]));

				this.months = labels.map((label, m) => ({
					label,
					weeks: monthWeekMap[m].map(ws => ({
						weekStart: ws,
						label: this.buildLabel(ws),
						plan: planMap.get(ws) ?? null,
						applying: false,
						removing: false,
						applyError: false,
						clearConfirming: false,
						clearing: false,
					})),
				}));
				this.monthsLoading = false;
				this.loading = false;
			},
			error: () => {
				this.monthsLoading = false;
				this.loadError = true;
			},
		});
	}

	applyTemplate(week: WeekRow) {
		if (!this.selectedTemplateId) return;
		const userId = localStorage.getItem('id') ?? '';
		week.applying = true;
		week.applyError = false;

		this.weekTemplateService.applyTemplate(userId, this.selectedTemplateId, week.weekStart).subscribe({
			next: plan => {
				week.plan = plan;
				week.applying = false;
				week.applyError = false;
			},
			error: () => {
				week.applying = false;
				week.applyError = true;
				setTimeout(() => (week.applyError = false), 3000);
			},
		});
	}

	removeTemplate(week: WeekRow) {
		const userId = localStorage.getItem('id') ?? '';
		week.removing = true;

		this.weekTemplateService.unapplyTemplate(userId, week.weekStart).subscribe({
			next: plan => {
				week.plan = plan;
				week.removing = false;
			},
			error: () => {
				week.removing = false;
			},
		});
	}

	clearWeek(week: WeekRow) {
		week.clearConfirming = true;
	}

	cancelClearWeek(week: WeekRow) {
		week.clearConfirming = false;
	}

	confirmClearWeek(week: WeekRow) {
		week.clearConfirming = false;
		const id = week.plan?._id;
		if (!id) return;

		week.clearing = true;
		this.weekPlannerService.deleteWeekPlan(id).subscribe({
			next: () => {
				week.plan = null;
				week.clearing = false;
			},
			error: () => {
				week.clearing = false;
			},
		});
	}

	workoutCount(week: WeekRow): number {
		if (!week.plan) return 0;
		return week.plan.days.reduce((acc, d) =>
			acc + d.workouts.length + d.morning.workouts.length + d.afternoon.workouts.length + d.evening.workouts.length, 0);
	}

	cardioCount(week: WeekRow): number {
		if (!week.plan) return 0;
		return week.plan.days.reduce((acc, d) =>
			acc + d.conditioning.length + d.morning.conditioning.length + d.afternoon.conditioning.length + d.evening.conditioning.length, 0);
	}

	hasContent(week: WeekRow): boolean {
		return this.workoutCount(week) > 0 || this.cardioCount(week) > 0;
	}

	blockForWeek(weekStart: string): TrainingBlock | null {
		return this.trainingBlocks.find(b =>
			weekStart >= b.startDate && (b.endDate === null || weekStart <= b.endDate),
		) ?? null;
	}

	private buildLabel(weekStart: string): string {
		const start = new Date(weekStart + 'T00:00:00');
		const end = addDays(start, 6);
		return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
	}
}
