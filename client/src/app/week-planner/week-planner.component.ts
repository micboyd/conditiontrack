import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DayPlan, TimeBlockKey, WeekPlan } from './models/WeekPlan';
import { addDays, addWeeks, format, isToday, parseISO, startOfWeek, subWeeks } from 'date-fns';

import { ActivatedRoute, Router } from '@angular/router';
import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { TrainingBlock } from '../training-blocks/models/TrainingBlock';
import { TrainingBlocksService } from '../training-blocks/training-blocks.service';
import { WeekPlannerService } from './week-planner.service';
import { WeekTemplateService } from './week-template.service';
import { Workout } from '../strength/models/Workout';
import { WorkoutService } from '../strength/workout-library/workout.service';
import { forkJoin } from 'rxjs';

export type BlockSelection = 'overarching' | TimeBlockKey;

@Component({
	selector: 'app-week-planner',
	templateUrl: './week-planner.component.html',
	standalone: false,
})
export class WeekPlannerComponent implements OnInit, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	resourcesLoading = false;
	saving = false;
	saved = false;
	saveError = false;
	loadError = false;

	private savedTimer?: ReturnType<typeof setTimeout>;
	private saveErrorTimer?: ReturnType<typeof setTimeout>;
	isEditMode = false;
	pasting = false;
	sessionToView: ConditioningSession | null = null;
	workoutToView: Workout | null = null;

	saveAsTemplateOpen = false;
	templateNameInput = '';
	creatingTemplate = false;
	saveTemplateError = false;

	copiedWeekPlan: WeekPlan | null = null;
	copiedFromWeekStart: string | null = null;

	editingNoteDay: string | null = null;
	noteInputValue = '';

	currentWeekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 });

	toggleMode() {
		this.isEditMode = !this.isEditMode;
	}

	private _selectedDay: DayPlan | null = null;
	private _selectedBlock: BlockSelection = 'overarching';
	private _weekPlan: WeekPlan;
	private _allWorkouts: Workout[] = [];
	private _allConditioningSessions: ConditioningSession[] = [];
	private _trainingBlocks: TrainingBlock[] = [];

	readonly blocks: { key: BlockSelection; label: string; icon: string }[] = [
		{ key: 'overarching', label: 'All Day',   icon: 'fa-calendar-day' },
		{ key: 'morning',     label: 'Morning',   icon: 'fa-sun' },
		{ key: 'afternoon',   label: 'Afternoon', icon: 'fa-cloud-sun' },
		{ key: 'evening',     label: 'Evening',   icon: 'fa-moon' },
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private weekPlannerService: WeekPlannerService,
		private weekTemplateService: WeekTemplateService,
		private workoutService: WorkoutService,
		private conditioningLibraryService: ConditioningLibraryService,
		private trainingBlocksService: TrainingBlocksService,
	) {}

	get weekStartStr(): string {
		return format(this.currentWeekStart, 'yyyy-MM-dd');
	}

	get weekLabel(): string {
		const end = addDays(this.currentWeekStart, 6);
		return `${format(this.currentWeekStart, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
	}

	get isCurrentWeek(): boolean {
		return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') === this.weekStartStr;
	}

	get weekPlan(): WeekPlan { return this._weekPlan; }
	get selectedDay(): DayPlan | null { return this._selectedDay; }
	get selectedBlock(): BlockSelection { return this._selectedBlock; }
	get allWorkouts(): Workout[] { return this._allWorkouts; }
	get pinnedWorkouts(): Workout[] { return this._allWorkouts.filter(w => w.showInWeekPlanner); }
	get otherWorkouts(): Workout[] { return this._allWorkouts.filter(w => !w.showInWeekPlanner); }
	get allConditioningSessions(): ConditioningSession[] { return this._allConditioningSessions; }

	get drawerTitle(): string {
		if (!this._selectedDay) return '';
		const block = this.blocks.find(b => b.key === this._selectedBlock);
		return `${this._selectedDay.dayName} — ${block?.label ?? ''}`;
	}

	ngOnInit() {
		this.resourcesLoading = true;
		this.loadError = false;

		// Support ?week=yyyy-MM-dd from the schedule "View" link
		const weekParam = this.route.snapshot.queryParamMap.get('week');
		if (weekParam) {
			this.currentWeekStart = startOfWeek(parseISO(weekParam), { weekStartsOn: 1 });
		}

		forkJoin({
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			workouts: this.workoutService.getAllWorkouts(),
			trainingBlocks: this.trainingBlocksService.getAllBlocks(),
		}).subscribe({
			next: ({ conditioningSessions, workouts, trainingBlocks }) => {
				this._allConditioningSessions = conditioningSessions;
				this._allWorkouts = workouts;
				this._trainingBlocks = trainingBlocks;
				this.getWeekPlan();
			},
			error: () => {
				this.resourcesLoading = false;
				this.loadError = true;
			},
		});
	}

	ngOnDestroy(): void {
		clearTimeout(this.savedTimer);
		clearTimeout(this.saveErrorTimer);
	}

	prevWeek(): void {
		this.currentWeekStart = subWeeks(this.currentWeekStart, 1);
		this.getWeekPlan();
	}

	nextWeek(): void {
		this.currentWeekStart = addWeeks(this.currentWeekStart, 1);
		this.getWeekPlan();
	}

	goToCurrentWeek(): void {
		this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		this.getWeekPlan();
	}

	goToWeek(dateStr: string): void {
		this.currentWeekStart = startOfWeek(parseISO(dateStr), { weekStartsOn: 1 });
		this.getWeekPlan();
	}

	get canPaste(): boolean {
		return !!this.copiedWeekPlan && this.copiedFromWeekStart !== this.weekStartStr;
	}

	copyCurrentWeek(): void {
		this.copiedWeekPlan = this._weekPlan;
		this.copiedFromWeekStart = this.weekStartStr;
	}

	pasteWeek(): void {
		if (!this.copiedWeekPlan) return;
		const copiedDays = this.copiedWeekPlan.days.map(d => ({
			...d,
			_id: '',
			workouts: [...d.workouts],
			conditioning: [...d.conditioning],
			morning:   { workouts: [...d.morning.workouts],   conditioning: [...d.morning.conditioning] },
			afternoon: { workouts: [...d.afternoon.workouts], conditioning: [...d.afternoon.conditioning] },
			evening:   { workouts: [...d.evening.workouts],   conditioning: [...d.evening.conditioning] },
		}));
		this._weekPlan = new WeekPlan({ weekStart: this.weekStartStr, days: copiedDays });
		this.autoSave();
	}

	getWeekPlan() {
		this.resourcesLoading = true;
		this.loadError = false;
		const userId = localStorage.getItem('id') ?? '';

		this.weekPlannerService.getWeekPlanByWeek(userId, this.weekStartStr).subscribe({
			next: weekPlan => {
				this._weekPlan = weekPlan ? new WeekPlan(weekPlan) : new WeekPlan({ weekStart: this.weekStartStr });
				this.resourcesLoading = false;
			},
			error: () => {
				this._weekPlan = new WeekPlan({ weekStart: this.weekStartStr });
				this.resourcesLoading = false;
				this.loadError = true;
			},
		});
	}

	private autoSave() {
		this.saving = true;
		this.saved = false;
		this.saveError = false;

		this._weekPlan.weekStart = this.weekStartStr;
		const payload = this._weekPlan.payload();

		this.weekPlannerService.upsertWeekPlan(payload).subscribe({
			next: (saved) => {
				this._weekPlan = new WeekPlan(saved);
				this.saving = false;
				this.saved = true;
				clearTimeout(this.savedTimer);
				this.savedTimer = setTimeout(() => this.saved = false, 2000);
			},
			error: () => {
				this.saving = false;
				this.saveError = true;
				clearTimeout(this.saveErrorTimer);
				this.saveErrorTimer = setTimeout(() => this.saveError = false, 3000);
			},
		});
	}

	openDrawer(day: DayPlan, block: BlockSelection) {
		this._selectedDay = day;
		this._selectedBlock = block;
		this.drawer.open();
	}

	addItem(workout?: Workout, session?: ConditioningSession) {
		const day = this._selectedDay?.dayName;
		if (!day) return;

		if (this._selectedBlock === 'overarching') {
			if (workout) this._weekPlan.addWorkout(day, workout);
			if (session) this._weekPlan.addConditioning(day, session);
		} else {
			if (workout) this._weekPlan.addWorkoutToBlock(day, this._selectedBlock, workout);
			if (session) this._weekPlan.addConditioningToBlock(day, this._selectedBlock, session);
		}
		this.drawer.close();
		this.autoSave();
	}

	removeWorkout(day: string, workout: Workout) {
		this._weekPlan.removeWorkout(day, workout);
		this.autoSave();
	}

	removeConditioning(day: string, session: ConditioningSession) {
		this._weekPlan.removeConditioning(day, session);
		this.autoSave();
	}

	removeWorkoutFromBlock(day: string, block: TimeBlockKey, workout: Workout) {
		this._weekPlan.removeWorkoutFromBlock(day, block, workout);
		this.autoSave();
	}

	removeConditioningFromBlock(day: string, block: TimeBlockKey, session: ConditioningSession) {
		this._weekPlan.removeConditioningFromBlock(day, block, session);
		this.autoSave();
	}

	dropWorkout(event: CdkDragDrop<any[]>, dayName: string, block: 'overarching' | TimeBlockKey) {
		if (event.previousIndex === event.currentIndex) return;
		const day = this._weekPlan.days.find(d => d.dayName === dayName);
		if (!day) return;
		const arr = block === 'overarching' ? day.workouts : day[block].workouts;
		moveItemInArray(arr, event.previousIndex, event.currentIndex);
		this.autoSave();
	}

	dropConditioning(event: CdkDragDrop<any[]>, dayName: string, block: 'overarching' | TimeBlockKey) {
		if (event.previousIndex === event.currentIndex) return;
		const day = this._weekPlan.days.find(d => d.dayName === dayName);
		if (!day) return;
		const arr = block === 'overarching' ? day.conditioning : day[block].conditioning;
		moveItemInArray(arr, event.previousIndex, event.currentIndex);
		this.autoSave();
	}

	startNoteEdit(day: DayPlan): void {
		this.editingNoteDay = day.dayName;
		this.noteInputValue = day.note ?? '';
	}

	cancelNoteEdit(): void {
		this.editingNoteDay = null;
		this.noteInputValue = '';
	}

	confirmNote(day: DayPlan): void {
		day.note = this.noteInputValue.trim();
		this.editingNoteDay = null;
		this.noteInputValue = '';
		this.autoSave();
	}

	clearNote(day: DayPlan): void {
		day.note = '';
		this.autoSave();
	}

	dayDate(index: number): string {
		return format(addDays(this.currentWeekStart, index), 'do MMM');
	}

	isTodayDate(index: number): boolean {
		return isToday(addDays(this.currentWeekStart, index));
	}

	getBlocksForWeek(): { block: TrainingBlock; startDay: number; endDay: number }[] {
		const results: { block: TrainingBlock; startDay: number; endDay: number }[] = [];
		for (const block of this._trainingBlocks) {
			const end = block.endDate || '9999-12-31';
			const weekEnd = format(addDays(this.currentWeekStart, 6), 'yyyy-MM-dd');
			if (block.startDate > weekEnd || end < this.weekStartStr) continue;
			const startDay = block.startDate <= this.weekStartStr ? 0
				: [...Array(7)].findIndex((_, i) => format(addDays(this.currentWeekStart, i), 'yyyy-MM-dd') >= block.startDate);
			const endDay = end >= weekEnd ? 6
				: [...Array(7)].reduce((last, _, i) => format(addDays(this.currentWeekStart, i), 'yyyy-MM-dd') <= end ? i : last, 0);
			results.push({ block, startDay, endDay });
		}
		return results;
	}

	hasAnyContent(day: DayPlan): boolean {
		return (
			day.workouts.length > 0 ||
			day.conditioning.length > 0 ||
			day.morning.workouts.length > 0 ||
			day.morning.conditioning.length > 0 ||
			day.afternoon.workouts.length > 0 ||
			day.afternoon.conditioning.length > 0 ||
			day.evening.workouts.length > 0 ||
			day.evening.conditioning.length > 0
		);
	}

	openSaveAsTemplate() {
		this.templateNameInput = '';
		this.saveTemplateError = false;
		this.saveAsTemplateOpen = true;
	}

	cancelSaveAsTemplate() {
		this.saveAsTemplateOpen = false;
	}

	confirmSaveAsTemplate() {
		const name = this.templateNameInput.trim();
		if (!name) return;

		this.creatingTemplate = true;
		this.saveTemplateError = false;

		const payload = {
			userId: this._weekPlan.userId,
			name,
			description: '',
			days: this._weekPlan.payload().days,
		};

		this.weekTemplateService.createTemplate(payload).subscribe({
			next: created => {
				this.creatingTemplate = false;
				this.saveAsTemplateOpen = false;
				this.router.navigate(['/week-planner/templates', created._id]);
			},
			error: () => {
				this.creatingTemplate = false;
				this.saveTemplateError = true;
			},
		});
	}

	retryLoad() {
		this.loadError = false;
		this.getWeekPlan();
	}
}
