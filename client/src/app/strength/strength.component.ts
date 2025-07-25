import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from './models/Exercise';
import { ExerciseSet } from './models/ExerciseSet';
import { MenuItem } from '../shared/models/MenuItem';
import { Workout } from './models/Workout';
import { WorkoutService } from './workout.service';

@Component({
	selector: 'app-strength',
	templateUrl: './strength.component.html',
	standalone: false,
})
export class StrengthComponent {
	workoutForm!: FormGroup;

    meunItems: MenuItem[] = [
        { route: '/strength/workout-records', label: 'Workout Records' },
        { route: '/strength/workout-library', label: 'Workouts' },
        { route: '/strength/exercise-library', label: 'Exercises' }
    ]

	constructor(private fb: FormBuilder, private workoutService: WorkoutService) {}

	ngOnInit() {
		this.workoutService.getWorkoutById('123').subscribe(response => {
			const workout = new Workout(
				response.id,
				response.name,
				response.description,
				response.exercises.map(
					(ex: any) =>
						new Exercise(
							ex.id,
							ex.name,
							ex.description,
							ex.sets.map((set: any) => new ExerciseSet(set.id, set.exerciseId, set.reps, set.weight)),
						),
				),
			);

			this.workoutForm = Workout.toFormGroup(workout, this.fb);
		});
	}

	get exercises(): FormArray {
		return this.workoutForm.get('exercises') as FormArray;
	}

	getSets(i: number): FormArray {
		return this.exercises.at(i).get('sets') as FormArray;
	}

	onSubmit() {
		console.log(this.workoutForm.value);
	}
}
