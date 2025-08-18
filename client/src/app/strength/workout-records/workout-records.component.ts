import { Component, OnInit } from '@angular/core';

import { Workout } from '../models/Workout';
import { WorkoutRecord } from '../models/WorkoutRecord';
import { WorkoutRecordService } from './workout-records.service';
import { WorkoutService } from '../workout-library/workout.service';
import { format } from 'date-fns';

@Component({
	selector: 'app-workout-records',
	templateUrl: './workout-records.component.html',
	standalone: false,
})
export class WorkoutRecordsComponent implements OnInit {

    workoutsLoading: boolean = false;
    workoutRecordsLoading: boolean = false;

	private _allWorkoutRecords: WorkoutRecord[] = [];
	private _allWorkouts: Workout[] = [];

	editModeEnabled: boolean = false;
	selectedWorkoutRecord: WorkoutRecord | null = null;

	constructor(public workoutRecordService: WorkoutRecordService, public workoutService: WorkoutService) {}

	ngOnInit(): void {
		this.getAllWorkoutRecords();
		this.getAllWorkouts();
	}

	get allWorkouts(): Array<Workout> {
		return this._allWorkouts;
	}

	get allWorkoutRecords(): Array<WorkoutRecord> {
		return this._allWorkoutRecords;
	}

    get workoutRecordLibraryLoading(): boolean {
        return this.workoutRecordsLoading || this.workoutsLoading;
    }

    formatDate(dateInput: string): string {
	    return format(dateInput, "dd/MM/yyyy");
    }

	openEditMode(workoutRecord?: WorkoutRecord): void {
		this.selectedWorkoutRecord = workoutRecord ?? null;
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.getAllWorkoutRecords();
		this.editModeEnabled = false;
	}

	getWorkoutName(workoutId: string): string {
		const workout = this.allWorkouts.find(w => w._id === workoutId);
		return workout?.name ?? '';
	}

	getAllWorkouts() {
        this.workoutsLoading = true;
		this.workoutService.getAllWorkouts().subscribe(allWorkouts => {
			this._allWorkouts = allWorkouts;
            this.workoutsLoading = false;
		});
	}

    getAllWorkoutRecords(): void {
        this.workoutRecordsLoading = true;
		this.workoutRecordService.getAllWorkoutRecords().subscribe(allWorkoutRecords => {
			this._allWorkoutRecords = allWorkoutRecords;
            this.workoutRecordsLoading = false;
		});
	}

    deleteWorkoutRecord(workoutRecord: WorkoutRecord): void {
        this.workoutRecordsLoading = true;
        this.workoutRecordService.deleteWorkoutRecord(workoutRecord._id).subscribe(() => {
            this.getAllWorkoutRecords();
            this.workoutRecordsLoading = false;
        })
    }
}
