import { format, getDay } from 'date-fns';

import { Component } from '@angular/core';
import { ConditioningSession } from '../../../conditioning/models/ConditioningSession';
import { WeekPlan } from '../../../week-planner/models/WeekPlan';
import { WeekPlannerService } from '../../../week-planner/week-planner.service';

@Component({
	selector: 'app-conditioning-widget',
	templateUrl: './conditioning-widget.component.html',
	standalone: false,
    providers: [WeekPlannerService],
})
export class ConditioningWidgetComponent {
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

    get todaysWorkouts(): ConditioningSession[] {
        const today = getDay(this.todaysDate);

        const day = this.weekPlan.days.find((day) => {
            return day.dayName === this.mapWorkDay(today);
        });

        return day.conditioning;
    }

    ngOnInit() {
        this.getAllWorkouts();
    }
}
