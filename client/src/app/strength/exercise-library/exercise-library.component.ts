import { Component, OnInit, ViewChild } from '@angular/core';

import { Exercise } from '../models/Exercise';
import { ExerciseService } from './exercise.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-exercise-library',
	templateUrl: './exercise-library.component.html',
	standalone: false,
})
export class ExerciseLibraryComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	exercisesLoading = false;
	selectedExercise: Exercise | null = null;
	private _allExercises: Exercise[] = [];

	constructor(public exerciseService: ExerciseService) {}

	get allExercises(): Exercise[] {
		return this._allExercises;
	}

	ngOnInit(): void {
		this.getAllExercises();
	}

	getAllExercises(): void {
		this.exercisesLoading = true;
		this.exerciseService.getAllExercises().subscribe((exercises) => {
			this.exercisesLoading = false;
			this._allExercises = exercises.map((e) => new Exercise(e));
		});
	}

	deleteExercise(exerciseId: string): void {
		this.exerciseService.deleteExercise(exerciseId).subscribe(() => {
			this.getAllExercises();
		});
	}

	openDrawer(exercise?: Exercise): void {
		this.selectedExercise = exercise ?? null;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.getAllExercises();
	}
}
