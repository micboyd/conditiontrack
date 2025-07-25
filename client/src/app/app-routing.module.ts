import { RouterModule, Routes } from '@angular/router';

import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExerciseLibraryComponent } from './strength/exercise-library/exercise-library.component';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { StrengthComponent } from './strength/strength.component';
import { StyleguideComponent } from './styleguide/styleguide.component';
import { WorkoutLibraryComponent } from './strength/workout-library/workout-library.component';
import { WorkoutRecordsComponent } from './strength/workout-records/workout-records.component';

const routes: Routes = [
  // Login remains at top level
  {
    path: 'login',
    component: AuthenticationComponent,
  },
  {
    path: '',
    component: MainLayoutComponent, // wraps the main app views
    children: [
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
      // default redirect under layout
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
