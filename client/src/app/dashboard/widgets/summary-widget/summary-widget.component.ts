import { Component, OnInit } from "@angular/core";
import { DayPlan, WeekPlan } from "../../../week-planner/models/WeekPlan";
import { addDays, format } from "date-fns";

import { WeekPlannerService } from "../../../week-planner/week-planner.service";

@Component({
    selector: "app-summary-widget",
    templateUrl: "./summary-widget.component.html",
    standalone: false
})
export class SummaryWidgetComponent implements OnInit {
    constructor(private weekPlannerService: WeekPlannerService) {}

    private _weekPlan: WeekPlan;

    weekPlanLoading = false;

    get weekPlan(): WeekPlan {
        return this._weekPlan;
    }

    get nexThreeDays(): Array<DayPlan> {
        console.log([this.getWorkoutsForDay(1), this.getWorkoutsForDay(2), this.getWorkoutsForDay(3)])
        return [this.getWorkoutsForDay(1), this.getWorkoutsForDay(2), this.getWorkoutsForDay(3)];
    }

    ngOnInit() {
        this.weekPlanLoading = true;
        this.weekPlannerService.getAllWeekPlans().subscribe((data) => {
            this._weekPlan = new WeekPlan(data);
            this.weekPlanLoading = false;
        });
    }

    dayOfWeek(daysAhead: number): string {
        const today = new Date();
        const tomorrow = addDays(today, daysAhead);
        const dayOfWeek = format(tomorrow, "EEEE");
        return dayOfWeek;
    }

    getWorkoutsForDay(daysAhead: number): DayPlan {
        const dayName = this.dayOfWeek(daysAhead);
        const day = this.weekPlan?.days.find((day) => day.dayName === dayName);
        return day;
    }
}
