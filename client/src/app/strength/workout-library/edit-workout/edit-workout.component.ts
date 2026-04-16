import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
	exerciseSearch = '';

	get filteredAvailableExercises(): Exercise[] {
		const q = this.exerciseSearch.trim().toLowerCase();
		if (!q) return this.avalibleExercises;
		return this.avalibleExercises.filter(e => e.name.toLowerCase().includes(q));
	}

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
		this.exerciseSearch = '';
		this.getAllExercises();
	}

	getAllExercises(): void {
		this.exercisesLoading = true;
		this.exerciseService.getAllExercises().subscribe(exercises => {
			this.allExercises = exercises.map(e => new Exercise(e));

			if (this.selectedWorkout?.exercises?.length) {
				// Rebuild in saved order so drag ordering is preserved
				this.selectedExercises = this.selectedWorkout.exercises
					.map(saved => {
						const ex = this.allExercises.find(e => e._id === saved._id);
						if (!ex) return null;
						return { _id: saved._id, name: ex.name, defaultSets: saved.defaultSets ?? 3, defaultReps: saved.defaultReps ?? 10 };
					})
					.filter(Boolean) as WorkoutExerciseTemplate[];

				const selectedIds = new Set(this.selectedExercises.map(e => e._id));
				this.avalibleExercises = this.allExercises.filter(e => !selectedIds.has(e._id));
			} else {
				this.selectedExercises = [];
				this.avalibleExercises = [...this.allExercises];
			}

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

	dropExercise(event: CdkDragDrop<WorkoutExerciseTemplate[]>): void {
		if (event.previousIndex === event.currentIndex) return;
		moveItemInArray(this.selectedExercises, event.previousIndex, event.currentIndex);
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

