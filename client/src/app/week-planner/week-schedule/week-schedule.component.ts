import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { WeekPlan } from '../models/WeekPlan';
import { WeekTemplate } from '../models/WeekTemplate';
import { WeekPlannerService } from '../week-planner.service';
import { WeekTemplateService } from '../week-template.service';

interface WeekRow {
	weekStart: string;
	label: string;
	plan: WeekPlan | null;
	applying: boolean;
	applied: boolean;
	applyError: boolean;
}

@Component({
	selector: 'app-week-schedule',
	templateUrl: './week-schedule.component.html',
	standalone: false,
})
export class WeekScheduleComponent implements OnInit {
	loading = false;
	loadError = false;
	weeks: WeekRow[] = [];
	templates: WeekTemplate[] = [];
	selectedTemplateId: string = '';

	constructor(
		private route: ActivatedRoute,
		private weekPlannerService: WeekPlannerService,
		private weekTemplateService: WeekTemplateService,
	) {}

	ngOnInit() {
		this.loading = true;
		this.loadError = false;

		const userId = localStorage.getItem('id') ?? '';
		const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

		// Generate 12 week entries
		const weekStarts = Array.from({ length: 12 }, (_, i) =>
			format(addWeeks(currentWeekStart, i), 'yyyy-MM-dd'),
		);

		this.weeks = weekStarts.map(weekStart => ({
			weekStart,
			label: this.buildLabel(weekStart),
			plan: null as WeekPlan | null,
			applying: false,
			applied: false,
			applyError: false,
		}));

		// Load templates + all week plans in parallel
		const weekPlan$ = weekStarts.map(ws =>
			this.weekPlannerService.getWeekPlanByWeek(userId, ws).pipe(
				catchError(() => of(null)),
			),
		);

		forkJoin({
			templates: this.weekTemplateService.getTemplates(userId).pipe(catchError(() => of([]))),
			weekPlans: forkJoin(weekPlan$),
		}).subscribe({
			next: ({ templates, weekPlans }) => {
				this.templates = templates.map(t => new WeekTemplate(t));
				weekPlans.forEach((plan, i) => {
					this.weeks[i].plan = plan;
				});
				this.loading = false;

				// Pre-select template from query param
				const templateId = this.route.snapshot.queryParamMap.get('templateId');
				if (templateId && this.templates.some(t => t._id === templateId)) {
					this.selectedTemplateId = templateId;
				} else if (this.templates.length > 0) {
					this.selectedTemplateId = this.templates[0]._id;
				}
			},
			error: () => {
				this.loading = false;
				this.loadError = true;
			},
		});
	}

	applyTemplate(week: WeekRow) {
		if (!this.selectedTemplateId) return;

		const userId = localStorage.getItem('id') ?? '';
		week.applying = true;
		week.applied = false;
		week.applyError = false;

		this.weekTemplateService.applyTemplate(userId, this.selectedTemplateId, week.weekStart).subscribe({
			next: (plan) => {
				week.plan = plan;
				week.applying = false;
				week.applied = true;
				setTimeout(() => (week.applied = false), 2500);
			},
			error: () => {
				week.applying = false;
				week.applyError = true;
				setTimeout(() => (week.applyError = false), 3000);
			},
		});
	}

	workoutCount(week: WeekRow): number {
		if (!week.plan) return 0;
		return week.plan.days.reduce((acc, d) => {
			return acc +
				d.workouts.length +
				d.morning.workouts.length +
				d.afternoon.workouts.length +
				d.evening.workouts.length;
		}, 0);
	}

	cardioCount(week: WeekRow): number {
		if (!week.plan) return 0;
		return week.plan.days.reduce((acc, d) => {
			return acc +
				d.conditioning.length +
				d.morning.conditioning.length +
				d.afternoon.conditioning.length +
				d.evening.conditioning.length;
		}, 0);
	}

	hasContent(week: WeekRow): boolean {
		return this.workoutCount(week) > 0 || this.cardioCount(week) > 0;
	}

	private buildLabel(weekStart: string): string {
		const start = new Date(weekStart + 'T00:00:00');
		const end = addDays(start, 6);
		return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
	}

	plannerLink(weekStart: string): string {
		return `/week-planner?week=${weekStart}`;
	}
}
