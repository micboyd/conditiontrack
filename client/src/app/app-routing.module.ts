import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './shared/guards/authentication.guard';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BodyCompositionComponent } from './body-composition/body-composition.component';
import { ConditioningComponent } from './conditioning/conditioning.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExerciseLibraryComponent } from './strength/exercise-library/exercise-library.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { GoalsComponent } from './goals/goals.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { NotesComponent } from './notes/notes.component';
import { NutritionComponent } from './nutrition/nutrition.component';
import { ProfileComponent } from './profile/profile.component';
import { StrengthComponent } from './strength/strength.component';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WorkoutLibraryComponent } from './strength/workout-library/workout-library.component';
import { WorkoutRecordsComponent } from './strength/workout-records/workout-records.component';

const routes: Routes = [
	// Login remains at top level
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'login', component: AuthenticationComponent },
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
			},
			{
				path: 'nutrition',
				component: NutritionComponent,
				canActivate: [AuthGuard],
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
		],
	},

	// wildcard route
	{ path: '**', redirectTo: 'dashboard' },
];
@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
