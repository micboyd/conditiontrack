import { Component, OnInit, ViewChild } from '@angular/core';

import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { Workout } from '../models/Workout';
import { WorkoutService } from './workout.service';

@Component({
	selector: 'app-workout-library',
	templateUrl: './workout-library.component.html',
	standalone: false,
})
export class WorkoutLibraryComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	workoutsLoading = false;
	selectedWorkout: Workout | null = null;
	private _allWorkouts: Workout[] = [];

	constructor(public workoutService: WorkoutService) {}

	ngOnInit(): void {
		this.getAllWorkouts();
	}

	get allWorkouts(): Workout[] {
		return this._allWorkouts;
	}

	getAllWorkouts(): void {
		this.workoutsLoading = true;
		this.workoutService.getAllWorkouts().subscribe((workouts) => {
			this.workoutsLoading = false;
			this._allWorkouts = workouts.map((w) => new Workout(w));
		});
	}

	deleteWorkout(workout: Workout): void {
		this.workoutService.deleteWorkout(workout._id).subscribe(() => {
			this.getAllWorkouts();
		});
	}

	openDrawer(workout?: Workout): void {
		this.selectedWorkout = workout ?? null;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.getAllWorkouts();
	}
}
