import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPlan, WeekPlan } from './models/WeekPlan';

import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { WeekPlannerService } from './week-planner.service';
import { Workout } from '../strength/models/Workout';
import { WorkoutService } from '../strength/workout-library/workout.service';
import { distinctUntilChanged } from 'rxjs';
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

	private _weekPlan: WeekPlan;
	private _allWorkouts: Workout[] = [];
	private _allConditioningSessions: ConditioningSession[] = [];

	constructor(
        private weekPlannerService: WeekPlannerService,
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

                this.getWeekPlan();
			},
		});
	}

	getWeekPlan() {
        this.weekPlannerService.getAllWeekPlans().subscribe((weekPlan) => {
            if (weekPlan.length === 0) {
                this.createWeekPlan();
            } else {
                this._weekPlan = new WeekPlan(weekPlan[0]);
            }
        })
    }

    createWeekPlan() {
        this.weekPlannerService.createWeekPlan(this._weekPlan.payload()).subscribe((weekPlan) => {
            this._weekPlan = weekPlan;
        });
    }

    updateWeekPlan() {
        this.weekPlannerService.updateWeekPlan(this.weekPlan._id, this._weekPlan.payload()).subscribe(() => {

        });
    }

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


	removeWorkout(day: string, workout: Workout) {
		this._weekPlan.removeWorkout(day, workout);
	}

	removeConditioning(day: string, session: ConditioningSession) {
		this._weekPlan.removeConditioning(day, session);
	}
}
