import { Component, OnInit } from '@angular/core';

import { Workout } from '../models/Workout';
import { WorkoutService } from './workout.service';

@Component({
	selector: 'app-workout-library',
	templateUrl: './workout-library.component.html',
	standalone: false,
})
export class WorkoutLibraryComponent implements OnInit {
	constructor(public workoutService: WorkoutService) {}

	workoutsLoading: boolean = false;
	private _allWorkouts: Workout[] = [];
	editModeEnabled: boolean = false;
	selectedWorkout: Workout | null = null;

	ngOnInit(): void {
		this.getAllWorkouts();
	}

	get allWorkouts(): Array<Workout> {
		return this._allWorkouts;
	}

	getAllWorkouts(): void {
		this.workoutsLoading = true;
		this.workoutService.getAllWorkouts().subscribe((workouts: Array<Workout>) => {
			this.workoutsLoading = false;
			this._allWorkouts = workouts.map(e => new Workout(e));
		});
	}

	deleteWorkout(workout: Workout): void {
		this.workoutsLoading = true;
		this.workoutService.deleteWorkout(workout._id).subscribe(() => {
			this.workoutsLoading = false;
			this.getAllWorkouts();
		});
	}

	openEditMode(workout?: Workout): void {
		this.selectedWorkout = workout ?? null;
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.getAllWorkouts();
		this.editModeEnabled = false;
	}
}

