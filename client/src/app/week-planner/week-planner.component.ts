import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPlan, TimeBlockKey, WeekPlan } from './models/WeekPlan';

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

	get weekPlan(): WeekPlan { return this._weekPlan; }
	get selectedDay(): DayPlan | null { return this._selectedDay; }
	get selectedBlock(): BlockSelection { return this._selectedBlock; }
	get allWorkouts(): Workout[] { return this._allWorkouts; }
	get allConditioningSessions(): ConditioningSession[] { return this._allConditioningSessions; }

	get drawerTitle(): string {
		if (!this._selectedDay) return '';
		const block = this.blocks.find(b => b.key === this._selectedBlock);
		return `${this._selectedDay.dayName} — ${block?.label ?? ''}`;
	}

	ngOnInit() {
		this.resourcesLoading = true;
		forkJoin({
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			workouts: this.workoutService.getAllWorkouts(),
		}).subscribe({
			next: ({ conditioningSessions, workouts }) => {
				this._allConditioningSessions = conditioningSessions;
				this._allWorkouts = workouts;
				this.resourcesLoading = false;
				this.getWeekPlan();
			},
		});
	}

	getWeekPlan() {
		this.weekPlannerService.getAllWeekPlans().subscribe(weekPlan => {
			this._weekPlan = weekPlan ? new WeekPlan(weekPlan) : new WeekPlan();
			if (!weekPlan) this.createWeekPlan();
		});
	}

	createWeekPlan() {
		this.resourcesLoading = true;
		this.weekPlannerService.createWeekPlan(this._weekPlan.payload()).subscribe(weekPlan => {
			this._weekPlan = new WeekPlan(weekPlan);
			this.resourcesLoading = false;
		});
	}

	private autoSave() {
		this.saving = true;
		this.saved = false;
		this.weekPlannerService.updateWeekPlan(this.weekPlan._id, this._weekPlan.payload()).subscribe(() => {
			this.saving = false;
			this.saved = true;
			setTimeout(() => this.saved = false, 2000);
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
}
