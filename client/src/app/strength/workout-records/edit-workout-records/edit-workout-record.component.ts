import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Workout } from '../../models/Workout';
import { WorkoutRecord } from '../../models/WorkoutRecord';
import { WorkoutRecordService } from '../workout-records.service';
import { WorkoutService } from '../../workout-library/workout.service';

@Component({
	selector: 'app-edit-workout-record',
	templateUrl: './edit-workout-record.component.html',
	standalone: false,
})
export class EditWorkoutRecordsComponent implements OnInit {
	allWorkouts: Workout[] = [];
	selectedWorkout: Workout | null = null;

	@Input() selectedWorkoutRecord: WorkoutRecord | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	formLoading: boolean = false;
	workoutsLoading: boolean = false;

	workoutRecordForm!: FormGroup;
    validationErrors: Array<string> = [];

	constructor(
		private fb: FormBuilder,
		private workoutService: WorkoutService,
		private workoutRecordService: WorkoutRecordService,
	) {}

	ngOnInit(): void {
		this.workoutsLoading = true;

		this.getAllWorkouts(() => {
			if (this.selectedWorkoutRecord) {
				this.loadFromExistingRecord(this.selectedWorkoutRecord);
			} else {
				const emptyRecord = new WorkoutRecord();
				this.workoutRecordForm = WorkoutRecord.toFormGroup(emptyRecord, this.fb);
			}

			this.workoutsLoading = false;
		});
	}

	/** EDIT MODE: Populate from saved record */
	private loadFromExistingRecord(recordData: WorkoutRecord) {
		// Find workout in library
		this.selectedWorkout = this.allWorkouts.find(w => w._id === recordData.workoutId) || null;

		const record = new WorkoutRecord(recordData);
		this.workoutRecordForm = WorkoutRecord.toFormGroup(record, this.fb);

		// Fill sets for each exercise
		record.exercises.forEach((ex, i) => {
			const setsArray = WorkoutRecord.getSets(this.exercisesArray, i);
			ex.sets.forEach(set => {
				setsArray.push(
					this.fb.group({
						reps: [set.reps],
						weight: [set.weight],
					}),
				);
			});
		});
	}

	selectWorkoutById(workoutId: string | null) {
		if (!workoutId) return;
		const workout = this.allWorkouts.find(w => w._id === workoutId);
		if (!workout) return;

		this.selectedWorkout = workout;

		const newRecord = WorkoutRecord.fromWorkoutTemplate(workout);

		this.selectedWorkoutRecord = newRecord;
		this.workoutRecordForm = WorkoutRecord.toFormGroup(newRecord, this.fb);
	}

	getAllWorkouts(callback?: () => void) {
		this.workoutService.getAllWorkouts().subscribe(workouts => {
			this.allWorkouts = workouts;
			if (callback) callback();
		});
	}

	/** Convenience getters */
	get exercisesArray() {
		return WorkoutRecord.getExercises(this.workoutRecordForm);
	}

	getSets(i: number) {
		return WorkoutRecord.getSets(this.exercisesArray, i);
	}

	addSet(i: number) {
		WorkoutRecord.addSet(this.exercisesArray, i, this.fb);
	}

	removeSet(i: number, j: number) {
		WorkoutRecord.removeSet(this.exercisesArray, i, j);
	}

	validateExercises(): string[] {
		const errors: string[] = [];

		this.exercisesArray.controls.forEach((exercise, exerciseIndex) => {
			const setsArray = exercise.get('sets') as FormArray;

			// 1. Check if no sets have been added
			if (!setsArray || setsArray.length === 0) {
				errors.push(`Exercise "${exercise.get('name')?.value || `#${exerciseIndex + 1}`}" has no sets added.`);
				return; // Skip further checks for this exercise
			}

			// 2. Check each set for missing fields
			setsArray.controls.forEach((set, setIndex) => {
				const reps = set.get('reps')?.value;
				const weight = set.get('weight')?.value;

				if (reps === null || reps === '' || weight === null || weight === '') {
					errors.push(
						`Exercise "${exercise.get('name')?.value || `#${exerciseIndex + 1}`}", Set ${
							setIndex + 1
						} is incomplete.`,
					);
				}
			});
		});

		return errors;
	}

	saveRecord() {
		this.validationErrors = this.validateExercises();

		if (this.validationErrors.length > 0) {
			return;
		}

		this.formLoading = true;

		if (this.workoutRecordForm.valid) {
            this.validationErrors = [];
			const payload = this.workoutRecordForm.value as WorkoutRecord;

			if (payload._id) {
				this.workoutRecordService.updateWorkoutRecord(payload._id, payload).subscribe(() => {
					this.closeEditMode();
					this.formLoading = false;
				});
			} else {
				this.workoutRecordService.createWorkoutRecord(payload).subscribe(() => {
					this.closeEditMode();
					this.formLoading = false;
				});
			}
		}
	}

    isInvalid(controlName: string): boolean {
		const control = this.workoutRecordForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	getWorkoutName(workoutRecord: WorkoutRecord | null): string {
		if (!workoutRecord) return '';
		const workout = this.allWorkouts.find(w => w._id === workoutRecord.workoutId);
		return workout ? workout.name : 'Unknown Workout';
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}
}
