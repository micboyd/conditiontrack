import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { BodyCompositionComponent } from './body-composition/body-composition.component';
import { BrowserModule } from '@angular/platform-browser';
import { ConditioningModule } from './conditioning/conditioning.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { GoalsModule } from './goals/goals.module';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { NotesComponent } from './notes/notes.component';
import { NutritionModule } from './nutrition/nutrition.module';
import { ProgressModule } from './progress/progress.module';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { StrengthModule } from './strength/strength.module';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WeekPlannerModule } from './week-planner/week-planner.module';
import { TrainingBlocksModule } from './training-blocks/training-blocks.module';
import { TrainingBlocksService } from './training-blocks/training-blocks.service';
import { StatsCentreModule } from './stats-centre/stats-centre.module';
import { SetupChecklistComponent } from './setup-checklist/setup-checklist.component';
import { ConditioningRecordService } from './conditioning/conditioning-records/conditioning-records.service';
import { DailyLogService } from './shared/services/daily-log.service';
import { MealLibraryService } from './nutrition/meal-library/meal-library.service';
import { WorkoutRecordService } from './strength/workout-records/workout-records.service';
import { WorkoutService } from './strength/workout-library/workout.service';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
	declarations: [
        AppComponent,
        StyleguideComponent,
        MainLayoutComponent,
        ProfileComponent,
        NotesComponent,
        BodyCompositionComponent,
        SetupChecklistComponent,
    ],
	imports: [
		BrowserModule,
		AppRoutingModule,
		SharedModule,
		DashboardModule,
		StrengthModule,
		ReactiveFormsModule,
		AuthenticationModule,
		ConditioningModule,
		NutritionModule,
		GlobalSettingsModule,
        WeekPlannerModule,
        ProgressModule,
        GoalsModule,
        TrainingBlocksModule,
        StatsCentreModule,
	],
	providers: [provideHttpClient(), WorkoutService, WorkoutRecordService, ConditioningRecordService, MealLibraryService, DailyLogService, TrainingBlocksService],
	bootstrap: [AppComponent],
})
export class AppModule {}
