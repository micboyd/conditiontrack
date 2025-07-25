import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { EditExerciseComponent } from './exercise-library/edit-exercise/edit-exercise.component';
import { ExerciseLibraryComponent } from './exercise-library/exercise-library.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../shared/shared.module";
import { StrengthComponent } from './strength.component';
import { WorkoutLibraryComponent } from './workout-library/workout-library.component';
import { WorkoutRecordsComponent } from './workout-records/workout-records.component';

@NgModule({
	declarations: [StrengthComponent, WorkoutLibraryComponent, WorkoutRecordsComponent, ExerciseLibraryComponent, EditExerciseComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule],
	exports: [StrengthComponent],
})
export class StrengthModule {
}

