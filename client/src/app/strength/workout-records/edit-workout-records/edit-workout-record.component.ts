import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

	workoutRecordForm!: FormGroup;

	constructor(private fb: FormBuilder, private workoutService: WorkoutService, private workoutRecordService: WorkoutRecordService) {}

	ngOnInit(): void {
		// Load workouts first, then decide mode
		this.getAllWorkouts(() => {
			if (this.selectedWorkoutRecord) {
				// EDIT MODE
				this.loadFromExistingRecord(this.selectedWorkoutRecord);
			} else {
				// CREATE MODE - blank record until workout is selected
				const emptyRecord = new WorkoutRecord();
				this.workoutRecordForm = WorkoutRecord.toFormGroup(emptyRecord, this.fb);
			}
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
	/** Load all workouts from service */
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

    saveRecord() {
        if (this.workoutRecordForm.valid) {
            const payload = this.workoutRecordForm.value as WorkoutRecord;

            if (payload._id) {
                this.workoutRecordService.updateWorkoutRecord(payload._id, payload).subscribe(() => {
                    this.closeEditMode();
                });
            } else {
                this.workoutRecordService.createWorkoutRecord(payload).subscribe(() => {
                    this.closeEditMode();
                });
            }
        }
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
