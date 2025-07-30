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
        console.log(workoutId)
		const workout = this.allWorkouts.find(w => w._id === workoutId);
		return workout?.name ?? '';
	}

	getAllWorkouts() {
		this.workoutService.getAllWorkouts().subscribe(allWorkouts => {
			this._allWorkouts = allWorkouts;
		});
	}

    deleteWorkoutRecord(workoutRecord: WorkoutRecord): void {
        this.workoutRecordService.deleteWorkoutRecord(workoutRecord._id).subscribe(() => {
            this.getAllWorkoutRecords();
        })
    }

	getAllWorkoutRecords(): void {
		this.workoutRecordService.getAllWorkoutRecords().subscribe(allWorkoutRecords => {
			this._allWorkoutRecords = allWorkoutRecords;
		});
	}
}
