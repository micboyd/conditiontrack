import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ExerciseLibraryComponent } from './strength/exercise-library/exercise-library.component';
import { NgModule } from '@angular/core';
import { StrengthComponent } from './strength/strength.component';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WorkoutLibraryComponent } from './strength/workout-library/workout-library.component';
import { WorkoutRecordsComponent } from './strength/workout-records/workout-records.component';

const routes: Routes = [
	{
		path: 'dashboard',
		component: DashboardComponent,
	},
	{
		path: 'styleguide',
		component: StyleguideComponent,
	},
	{
		path: 'strength',
		component: StrengthComponent,
		children: [
			{
				path: 'workout-records',
				component: WorkoutRecordsComponent,
			},
			{
				path: 'workout-library',
				component: WorkoutLibraryComponent,
			},
			{
				path: 'exercise-library',
				component: ExerciseLibraryComponent,
			},
		],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
