import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPlan, WeekPlan } from './models/WeekPlan';

import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { Workout } from '../strength/models/Workout';
import { WorkoutService } from '../strength/workout-library/workout.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
	selector: 'app-week-planner',
	templateUrl: './week-planner.component.html',
	standalone: false,
})
export class WeekPlannerComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	resourcesLoading: boolean = false;

	private _selectedDay: DayPlan | null = null;

	private _weekPlan: WeekPlan = new WeekPlan();
	private _allWorkouts: Workout[] = [];
	private _allConditioningSessions: ConditioningSession[] = [];

	constructor(
		private workoutService: WorkoutService,
		private conditioningLibraryService: ConditioningLibraryService,
	) {}

	get weekPlan(): WeekPlan {
		return this._weekPlan;
	}

	get selectedDay(): DayPlan | null {
		return this._selectedDay;
	}

	get allWorkouts(): Workout[] {
		return this._allWorkouts;
	}

	get allConditioningSessions(): ConditioningSession[] {
		return this._allConditioningSessions;
	}

	ngOnInit() {
		const conditioning$ = this.conditioningLibraryService.getAllConditioningSessions();
		const workouts$ = this.workoutService.getAllWorkouts();

		this.resourcesLoading = true;

		forkJoin({
			conditioningSessions: conditioning$,
			workouts: workouts$,
		}).subscribe({
			next: ({ conditioningSessions, workouts }) => {
				this._allConditioningSessions = conditioningSessions;
				this._allWorkouts = workouts;
				this.resourcesLoading = false;
			},
		});
	}

	getWeekPlan() {}

	editDay(day: DayPlan) {
		this._selectedDay = day;
		this.drawer.open();
	}

	addWorkoutToDay(day: string, workout: Workout) {
		this._weekPlan.addWorkout(day, workout);
		this.drawer.close();
	}

	addConditioningToDay(day: string, session: ConditioningSession) {
		this._weekPlan.addConditioning(day, session);
		this.drawer.close();
	}
}
