import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { EditExerciseComponent } from './exercise-library/edit-exercise/edit-exercise.component';
import { EditWorkoutComponent } from './workout-library/edit-workout/edit-workout.component';
import { ExerciseLibraryComponent } from './exercise-library/exercise-library.component';
import { ExerciseService } from './exercise-library/exercise.service';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from "../shared/shared.module";
import { StrengthComponent } from './strength.component';
import { WorkoutLibraryComponent } from './workout-library/workout-library.component';
import { WorkoutRecordsComponent } from './workout-records/workout-records.component';
import { WorkoutService } from './workout-library/workout.service';

@NgModule({
	declarations: [StrengthComponent, WorkoutLibraryComponent, WorkoutRecordsComponent, ExerciseLibraryComponent, EditExerciseComponent, EditWorkoutComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule],
	exports: [StrengthComponent],
    providers: [WorkoutService, ExerciseService]
})
export class StrengthModule {
}

