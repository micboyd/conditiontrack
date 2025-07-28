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
        this.workoutService.getAllWorkouts().subscribe((workouts: Array<Workout>) => {
            this._allWorkouts = workouts.map(e => new Workout(e));
        });
    }

    deleteWorkout(workoutId: string): void {
        this.workoutService.deleteWorkout(workoutId).subscribe(() => {
            this.getAllWorkouts();
        });
    }

    openEditMode(workout?: Workout): void {
        this. selectedWorkout = workout ?? null;
        this.editModeEnabled = true;
    }

    closeEditMode(): void {
        this.getAllWorkouts();
        this.editModeEnabled = false;
    }
}
