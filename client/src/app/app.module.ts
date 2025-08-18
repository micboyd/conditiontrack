import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { BodyCompositionComponent } from './body-composition/body-composition.component';
import { BrowserModule } from '@angular/platform-browser';
import { ConditioningModule } from './conditioning/conditioning.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GlobalSettingsModule } from './global-settings/global-settings.module';
import { GoalsComponent } from './goals/goals.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { NotesComponent } from './notes/notes.component';
import { NutritionModule } from './nutrition/nutrition.module';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { StrengthModule } from './strength/strength.module';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WeekPlannerModule } from './week-planner/week-planner.module';
import { WorkoutService } from './strength/workout-library/workout.service';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
	declarations: [
        AppComponent,
        StyleguideComponent,
        MainLayoutComponent,
        ProfileComponent,
        GoalsComponent,
        NotesComponent,
        BodyCompositionComponent
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
        WeekPlannerModule
	],
	providers: [provideHttpClient(), WorkoutService],
	bootstrap: [AppComponent],
})
export class AppModule {}
