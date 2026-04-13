import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from '../../models/Exercise';
import { ExerciseService } from '../../exercise-library/exercise.service';
import { Workout, WorkoutExerciseTemplate } from '../../models/Workout';
import { WorkoutService } from '../workout.service';

@Component({
	selector: 'app-edit-workout',
	templateUrl: './edit-workout.component.html',
	standalone: false,
})
export class EditWorkoutComponent implements OnInit, OnChanges {
	workoutForm!: FormGroup;

	@Input() selectedWorkout: Workout | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	exercisesLoading: boolean = false;
	formLoading: boolean = false;

	allExercises: Exercise[] = [];
	avalibleExercises: Exercise[] = [];
	selectedExercises: WorkoutExerciseTemplate[] = [];

	constructor(
		private fb: FormBuilder,
		public workoutService: WorkoutService,
		private exerciseService: ExerciseService,
	) {}

	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedWorkout']) {
			this.initForm();
		}
	}

	private initForm(): void {
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
					const existing = this.selectedWorkout!.exercises.find(e => e._id === ex._id);
					this.selectedExercises.push({
						_id: ex._id,
						name: ex.name,
						defaultSets: existing?.defaultSets ?? 3,
						defaultReps: existing?.defaultReps ?? 10,
					});
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
			this.selectedExercises.push({
				_id: exercise._id,
				name: exercise.name,
				defaultSets: 3,
				defaultReps: 10,
			});
			this.avalibleExercises.splice(index, 1);
		}
	}

	removeExercise(template: WorkoutExerciseTemplate): void {
		const index = this.selectedExercises.findIndex(e => e._id === template._id);
		if (index > -1) {
			this.selectedExercises.splice(index, 1);
			const ex = this.allExercises.find(e => e._id === template._id);
			if (ex) this.avalibleExercises.push(ex);
		}
	}

	updateDefaultSets(exercise: WorkoutExerciseTemplate, value: string): void {
		exercise.defaultSets = Math.max(1, parseInt(value, 10) || 1);
	}

	updateDefaultReps(exercise: WorkoutExerciseTemplate, value: string): void {
		exercise.defaultReps = Math.max(1, parseInt(value, 10) || 1);
	}

	isInvalid(controlName: string): boolean {
		const control = this.workoutForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	onSubmit(): void {
		this.workoutForm.markAllAsTouched();
		if (this.workoutForm.invalid) return;

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

