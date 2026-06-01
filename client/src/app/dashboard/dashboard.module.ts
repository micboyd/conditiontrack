import { ActivitySectionComponent } from './activity-section/activity-section.component';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { DailyLogService } from '../shared/services/daily-log.service';
import { DailyTotalsCardComponent } from './daily-totals-card/daily-totals-card.component';
import { DashboardComponent } from './dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MealLibraryService } from '../nutrition/meal-library/meal-library.service';
import { NgModule } from '@angular/core';
import { SetupChecklistComponent } from './setup-checklist/setup-checklist.component';
import { SharedModule } from '../shared/shared.module';
import { WeekPanelComponent } from './week-panel/week-panel.component';
import { WeekPlannerService } from '../week-planner/week-planner.service';
import { GoalsService } from '../goals/goals.service';
import { MeasurementsService } from '../progress/measurements/measurements.service';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';
import { WorkoutService } from '../strength/workout-library/workout.service';

@NgModule({
	declarations: [DashboardComponent, SetupChecklistComponent, DailyTotalsCardComponent, ActivitySectionComponent, WeekPanelComponent],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, AppRoutingModule, SharedModule],
	providers: [
		WorkoutService,
		WorkoutRecordService,
		ConditioningLibraryService,
		ConditioningRecordService,
		WeekPlannerService,
		MealLibraryService,
		DailyLogService,
		GoalsService,
		MeasurementsService,
	],
})
export class DashboardModule {}
