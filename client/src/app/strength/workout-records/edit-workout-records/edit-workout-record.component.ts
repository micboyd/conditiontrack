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
	@Input() initialDate?: string;
	@Input() maxDate?: string;
	@Input() lastRecord: WorkoutRecord | null = null;

	@Output() closeEditModeEvent = new EventEmitter<void>();
	@Output() recordSaved = new EventEmitter<WorkoutRecord>();

	formLoading: boolean = false;
	workoutsLoading: boolean = false;
	closeOnSave = true;
	searchQuery = '';

	workoutRecordForm!: FormGroup;

	constructor(
		private fb: FormBuilder,
		private workoutService: WorkoutService,
		private workoutRecordService: WorkoutRecordService,
	) {}

	get filteredWorkouts(): Workout[] {
		if (!this.searchQuery.trim()) return this.allWorkouts;
		const q = this.searchQuery.toLowerCase();
		return this.allWorkouts.filter(w => w.name.toLowerCase().includes(q));
	}

	ngOnInit(): void {
		this.workoutsLoading = true;

		this.getAllWorkouts(() => {
			if (this.selectedWorkoutRecord) {
				this.loadFromExistingRecord(this.selectedWorkoutRecord);
			} else {
				const emptyRecord = new WorkoutRecord();
				if (this.initialDate) emptyRecord.date = this.initialDate;
				this.workoutRecordForm = WorkoutRecord.toFormGroup(emptyRecord, this.fb);
			}

			this.workoutsLoading = false;
		});
	}

	/** EDIT MODE: Populate from saved record */
	private loadFromExistingRecord(recordData: WorkoutRecord) {
		this.selectedWorkout = this.allWorkouts.find(w => w._id === recordData.workoutId) || null;
		const record = new WorkoutRecord(recordData);
		this.workoutRecordForm = WorkoutRecord.toFormGroup(record, this.fb);
	}

	selectWorkoutById(workoutId: string | null) {
		if (!workoutId) return;
		const workout = this.allWorkouts.find(w => w._id === workoutId);
		if (!workout) return;

		this.selectedWorkout = workout;
		this.searchQuery = '';

		const newRecord = WorkoutRecord.fromWorkoutTemplate(workout);
		if (this.initialDate) newRecord.date = this.initialDate;

		this.selectedWorkoutRecord = newRecord;
		this.workoutRecordForm = WorkoutRecord.toFormGroup(newRecord, this.fb);
	}

	getAllWorkouts(callback?: () => void) {
		this.workoutService.getAllWorkouts().subscribe(workouts => {
			this.allWorkouts = workouts;
			if (callback) callback();
		});
	}

	getExerciseLastSummary(exerciseName: string): { setCount: number; reps: number; maxWeight: number; suggestedWeight: number } | null {
		if (!this.lastRecord || !exerciseName) return null;
		const ex = this.lastRecord.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
		if (!ex || ex.sets.length === 0) return null;
		const weights = ex.sets.map(s => s.weight).filter(w => w > 0);
		if (weights.length === 0) return null;
		const maxWeight = Math.max(...weights);
		const repCounts = ex.sets.map(s => s.reps).filter(r => r > 0);
		const avgReps = repCounts.length
			? Math.round(repCounts.reduce((a, b) => a + b, 0) / repCounts.length)
			: 0;
		const suggestedWeight = Math.round(maxWeight * 1.025 * 2) / 2;
		return { setCount: ex.sets.length, reps: avgReps, maxWeight, suggestedWeight };
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
		this.formLoading = true;
		const payload = this.workoutRecordForm.value as WorkoutRecord;

		if (payload._id) {
			this.workoutRecordService.updateWorkoutRecord(payload._id, payload).subscribe((record) => {
				this.formLoading = false;
				this.recordSaved.emit(record);
				if (this.closeOnSave) this.closeEditMode();
			});
		} else {
			this.workoutRecordService.createWorkoutRecord(payload).subscribe((record) => {
				this.workoutRecordForm.patchValue({ _id: record._id }, { emitEvent: false });
				this.formLoading = false;
				this.recordSaved.emit(record);
				if (this.closeOnSave) this.closeEditMode();
			});
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
