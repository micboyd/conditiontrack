import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPlan, TimeBlockKey, WeekPlan } from './models/WeekPlan';
import { addDays, addWeeks, format, startOfWeek, subWeeks, parseISO } from 'date-fns';

import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { WeekPlannerService } from './week-planner.service';
import { Workout } from '../strength/models/Workout';
import { WorkoutService } from '../strength/workout-library/workout.service';
import { forkJoin } from 'rxjs';

export type BlockSelection = 'overarching' | TimeBlockKey;

@Component({
	selector: 'app-week-planner',
	templateUrl: './week-planner.component.html',
	standalone: false,
})
export class WeekPlannerComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	resourcesLoading = false;
	saving = false;
	saved = false;
	saveError = false;
	loadError = false;
	isEditMode = false;
	copying = false;
	sessionToView: ConditioningSession | null = null;

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

	readonly blocks: { key: BlockSelection; label: string; icon: string }[] = [
		{ key: 'overarching', label: 'All Day',   icon: 'fa-calendar-day' },
		{ key: 'morning',     label: 'Morning',   icon: 'fa-sun' },
		{ key: 'afternoon',   label: 'Afternoon', icon: 'fa-cloud-sun' },
		{ key: 'evening',     label: 'Evening',   icon: 'fa-moon' },
	];

	constructor(
		private weekPlannerService: WeekPlannerService,
		private workoutService: WorkoutService,
		private conditioningLibraryService: ConditioningLibraryService,
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

		forkJoin({
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			workouts: this.workoutService.getAllWorkouts(),
		}).subscribe({
			next: ({ conditioningSessions, workouts }) => {
				this._allConditioningSessions = conditioningSessions;
				this._allWorkouts = workouts;
				this.getWeekPlan();
			},
			error: () => {
				this.resourcesLoading = false;
				this.loadError = true;
			},
		});
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

	copyToNextWeek(): void {
		const userId = localStorage.getItem('id') ?? '';
		const fromWeekStart = this.weekStartStr;
		const toWeekStart = format(addWeeks(this.currentWeekStart, 1), 'yyyy-MM-dd');
		this.copying = true;
		this.weekPlannerService.copyWeek(userId, fromWeekStart, toWeekStart).subscribe({
			next: () => {
				this.copying = false;
				this.nextWeek();
			},
			error: () => { this.copying = false; },
		});
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
				setTimeout(() => this.saved = false, 2000);
			},
			error: () => {
				this.saving = false;
				this.saveError = true;
				setTimeout(() => this.saveError = false, 3000);
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

	retryLoad() {
		this.loadError = false;
		this.getWeekPlan();
	}
}
