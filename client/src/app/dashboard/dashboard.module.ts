import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { DailyLogService } from '../shared/services/daily-log.service';
import { DashboardComponent } from './dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MealLibraryService } from '../nutrition/meal-library/meal-library.service';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { WeekPlannerService } from '../week-planner/week-planner.service';
import { GoalsService } from '../goals/goals.service';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';
import { WorkoutService } from '../strength/workout-library/workout.service';

@NgModule({
	declarations: [DashboardComponent],
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
	],
})
export class DashboardModule {}
