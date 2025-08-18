import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from '../../models/Exercise';
import { ExerciseService } from '../../exercise-library/exercise.service';
import { Workout } from '../../models/Workout';
import { WorkoutService } from '../workout.service';

@Component({
	selector: 'app-edit-workout',
	templateUrl: './edit-workout.component.html',
	standalone: false,
})
export class EditWorkoutComponent implements OnInit {
	workoutForm!: FormGroup;

	@Input() selectedWorkout: Workout | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	exercisesLoading: boolean = false;
	formLoading: boolean = false;

	allExercises: Exercise[] = [];
	avalibleExercises: Exercise[] = [];
	selectedExercises: Exercise[] = [];

	constructor(
		private fb: FormBuilder,
		public workoutService: WorkoutService,
		private exerciseService: ExerciseService,
	) {}

	ngOnInit(): void {
		this.workoutForm = Workout.toFormGroup(this.selectedWorkout ?? new Workout(null), this.fb);
		this.getAllExercises();
	}

	getAllExercises(): void {
		this.exercisesLoading = true;
		this.exerciseService.getAllExercises().subscribe(exercises => {
			this.allExercises = exercises.map(e => new Exercise(e));

			const selectedIds = this.selectedWorkout?.exercises?.map(e => e._id) ?? [];

			this.selectedExercises = [];
			this.avalibleExercises = [];

			this.allExercises.forEach(ex => {
				if (selectedIds.includes(ex._id)) {
					this.selectedExercises.push(ex);
				} else {
					this.avalibleExercises.push(ex);
				}
			});

			this.exercisesLoading = false;
		});
	}

	selectExercise(exercise: Exercise): void {
		const index = this.avalibleExercises.indexOf(exercise);
		if (index > -1) {
			this.selectedExercises.push(exercise);
			this.avalibleExercises.splice(index, 1);
		}
	}

	removeExercise(exercise: Exercise): void {
		const index = this.selectedExercises.indexOf(exercise);
		if (index > -1) {
			this.selectedExercises.splice(index, 1);
			this.avalibleExercises.push(exercise);
		}
	}

	isInvalid(controlName: string): boolean {
		const control = this.workoutForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	onSubmit(): void {
		this.formLoading = true;

		const payload = {
			...this.workoutForm.value,
			exercises: this.selectedExercises,
		};

		if (this.selectedWorkout) {
			if (this.selectedWorkout && this.selectedWorkout._id) {
				this.workoutService.updateWorkout(this.selectedWorkout._id, payload).subscribe(() => {
					this.formLoading = false;
					this.closeEditModeEvent.emit();
				});
			}
		} else {
			this.workoutService.createWorkout(payload).subscribe(() => {
				this.formLoading = false;
				this.closeEditModeEvent.emit();
			});
		}
	}
}

