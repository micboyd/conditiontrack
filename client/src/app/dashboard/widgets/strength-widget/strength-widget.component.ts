import { format, getDay } from 'date-fns';

import { Component } from '@angular/core';
import { WeekPlan } from '../../../week-planner/models/WeekPlan';
import { WeekPlannerService } from '../../../week-planner/week-planner.service';
import { Workout } from '../../../strength/models/Workout';

@Component({
	selector: 'app-strength-widget',
	templateUrl: './strength-widget.component.html',
	standalone: false,
    providers: [WeekPlannerService],
})
export class StrengthWidgetComponent {
	constructor(private weekPlannerService: WeekPlannerService) {}

    private _weekPlan: WeekPlan;

	todaysDate = new Date();
	formattedDate = format(this.todaysDate, "eeee, do 'of' MMMM yyyy");

    workDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    mapWorkDay(dayIndex: number): string {
        return this.workDays[dayIndex];
    }

    getAllWorkouts() {
        this.weekPlannerService.getAllWeekPlans().subscribe((weekPlan) => {
            this._weekPlan = new WeekPlan(weekPlan);

            console.log(this.todaysWorkouts, this._weekPlan);
        });
    }

    get weekPlan(): WeekPlan {
        return this._weekPlan;
    }

    get todaysWorkouts(): Workout[] {
        const today = getDay(this.todaysDate);

        const day = this.weekPlan.days.find((day) => {
            return day.dayName === this.mapWorkDay(today);
        });

        return day.workouts;
    }

    ngOnInit() {
        this.getAllWorkouts();
    }
}
