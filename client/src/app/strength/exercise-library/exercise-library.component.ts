import { Component, OnInit } from '@angular/core';

import { Exercise } from '../models/Exercise';
import { ExerciseService } from './exercise.service';

@Component({
	selector: 'app-exercise-library',
	templateUrl: './exercise-library.component.html',
	standalone: false,
})
export class ExerciseLibraryComponent implements OnInit {

    selectedExercise: Exercise | null = null;
	private _allExercises: Array<Exercise> = [];
	editModeEnabled: boolean = false;

	constructor(public exerciseService: ExerciseService) {}

	get allExercises(): Array<Exercise> {
		return this._allExercises;
	}

	ngOnInit(): void {
		this.getAllExercises();
	}

	getAllExercises(): void {
		this.exerciseService
			.getAllExercises()
			.subscribe((exercises: Array<Exercise>) => {
				this._allExercises = exercises.map(e => new Exercise(e));
			});
	}

	deleteExercise(exerciseId: string): void {
		this.exerciseService.deleteExercise(exerciseId).subscribe(() => {
			this.getAllExercises();
		});
	}

    openEditMode(exercise?: Exercise): void {
        this.selectedExercise = exercise ?? null;
        this.editModeEnabled = true;
    }

	closeEditMode(): void {
        this.getAllExercises();
		this.editModeEnabled = false;
	}
}
