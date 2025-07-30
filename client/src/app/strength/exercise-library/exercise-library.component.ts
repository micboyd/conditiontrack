import { Component, OnInit } from '@angular/core';

import { Exercise } from '../models/Exercise';
import { ExerciseService } from './exercise.service';

@Component({
	selector: 'app-exercise-library',
	templateUrl: './exercise-library.component.html',
	standalone: false,
})
export class ExerciseLibraryComponent implements OnInit {
	exercisesLoading: boolean = false;
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
		this.exercisesLoading = true;
		this.exerciseService.getAllExercises().subscribe((exercises: Array<Exercise>) => {
			this.exercisesLoading = false;
			this._allExercises = exercises.map(e => new Exercise(e));
		});
	}

	deleteExercise(exerciseId: string): void {
		this.exercisesLoading = true;
		this.exerciseService.deleteExercise(exerciseId).subscribe(() => {
			this.exercisesLoading = false;
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

