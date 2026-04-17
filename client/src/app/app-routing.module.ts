import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './shared/guards/authentication.guard';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BodyCompositionComponent } from './body-composition/body-composition.component';
import { ConditioningComponent } from './conditioning/conditioning.component';
import { ConditioningLibraryComponent } from './conditioning/conditioning-library/conditioning-library.component';
import { ConditioningRecordsComponent } from './conditioning/conditioning-records/conditioning-records.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExerciseLibraryComponent } from './strength/exercise-library/exercise-library.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { GoalsComponent } from './goals/goals.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { MealLibraryComponent } from './nutrition/meal-library/meal-library.component';
import { MealPlansComponent } from './nutrition/meal-plans/meal-plans.component';
import { NgModule } from '@angular/core';
import { NotesComponent } from './notes/notes.component';
import { NutritionComponent } from './nutrition/nutrition.component';
import { ProfileComponent } from './profile/profile.component';
import { StrengthComponent } from './strength/strength.component';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WorkoutRecordsComponent } from './strength/workout-records/workout-records.component';
import { WeekPlannerComponent } from './week-planner/week-planner.component';
import { WorkoutLibraryComponent } from './strength/workout-library/workout-library.component';
import { ProgressComponent } from './progress/progress.component';
import { MeasurementsComponent } from './progress/measurements/measurements.component';
import { ProgressPhotosComponent } from './progress/progress-photos/progress-photos.component';
import { TimelineComponent } from './progress/timeline/timeline.component';
import { TrainingBlocksComponent } from './training-blocks/training-blocks.component';
import { VerifyEmailComponent } from './authentication/verify-email/verify-email.component';
import { SetupChecklistComponent } from './setup-checklist/setup-checklist.component';
import { StatsCentreComponent } from './stats-centre/stats-centre.component';

const routes: Routes = [
	// Login remains at top level
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'login', component: AuthenticationComponent },
	{ path: 'verify-email', component: VerifyEmailComponent },
	{
		path: '',
		component: MainLayoutComponent, // wraps the main app views
		children: [
			{
				path: 'dashboard',
				component: DashboardComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'styleguide',
				component: StyleguideComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'strength',
				component: StrengthComponent,
				canActivate: [AuthGuard],
				children: [
					{ path: '', redirectTo: 'workout-records', pathMatch: 'full' },
					{
						path: 'workout-records',
						component: WorkoutRecordsComponent,
						canActivate: [AuthGuard],
					},
					{
						path: 'workout-library',
						component: WorkoutLibraryComponent,
						canActivate: [AuthGuard],
					},
					{
						path: 'exercise-library',
						component: ExerciseLibraryComponent,
						canActivate: [AuthGuard],
					},
				],
			},
			{
				path: 'conditioning',
				component: ConditioningComponent,
				canActivate: [AuthGuard],
				children: [
					{ path: '', redirectTo: 'conditioning-records', pathMatch: 'full' },
					{
						path: 'conditioning-records',
						component: ConditioningRecordsComponent,
						canActivate: [AuthGuard],
					},
					{
						path: 'conditioning-library',
						component: ConditioningLibraryComponent,
						canActivate: [AuthGuard],
					},
				],
			},
			{
				path: 'nutrition',
				component: NutritionComponent,
				canActivate: [AuthGuard],
				children: [
					{ path: '', redirectTo: 'meal-library', pathMatch: 'full' },
					{
						path: 'meal-library',
						component: MealLibraryComponent,
						canActivate: [AuthGuard],
					},
					{
						path: 'meal-plans',
						component: MealPlansComponent,
						canActivate: [AuthGuard],
					},
				],
			},
			{
				path: 'global-settings',
				component: GlobalSettingsComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'goals',
				component: GoalsComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'notes',
				component: NotesComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'body-composition',
				component: BodyCompositionComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'profile',
				component: ProfileComponent,
				canActivate: [AuthGuard],
			},
            			{
				path: 'week-planner',
				component: WeekPlannerComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'training-blocks',
				component: TrainingBlocksComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'setup-checklist',
				component: SetupChecklistComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'stats-centre',
				component: StatsCentreComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'progress',
				component: ProgressComponent,
				canActivate: [AuthGuard],
				children: [
					{ path: '', redirectTo: 'measurements', pathMatch: 'full' },
					{ path: 'measurements', component: MeasurementsComponent, canActivate: [AuthGuard] },
					{ path: 'timeline', component: TimelineComponent, canActivate: [AuthGuard] },
					{ path: 'photos', redirectTo: 'measurements', pathMatch: 'full' },
				],
			},
		],
	},

	// wildcard route
	{ path: '**', redirectTo: 'dashboard' },
];
@NgModule({
	imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
