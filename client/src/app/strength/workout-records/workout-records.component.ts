import { Component, OnInit, ViewChild } from '@angular/core';

import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { Workout } from '../models/Workout';
import { WorkoutRecord } from '../models/WorkoutRecord';
import { WorkoutRecordService } from './workout-records.service';
import { WorkoutService } from '../workout-library/workout.service';
import { format, parseISO } from 'date-fns';

@Component({
	selector: 'app-workout-records',
	templateUrl: './workout-records.component.html',
	standalone: false,
})
export class WorkoutRecordsComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	workoutsLoading = false;
	workoutRecordsLoading = false;

	private _allWorkoutRecords: WorkoutRecord[] = [];
	private _allWorkouts: Workout[] = [];

	selectedWorkoutRecord: WorkoutRecord | null = null;

	constructor(public workoutRecordService: WorkoutRecordService, public workoutService: WorkoutService) {}

	ngOnInit(): void {
		this.getAllWorkoutRecords();
		this.getAllWorkouts();
	}

	get allWorkouts(): Workout[] {
		return this._allWorkouts;
	}

	get allWorkoutRecords(): WorkoutRecord[] {
		return this._allWorkoutRecords;
	}

	get loading(): boolean {
		return this.workoutRecordsLoading || this.workoutsLoading;
	}

	formatDate(dateInput: string): string {
		try {
			return format(parseISO(dateInput), 'dd MMM yyyy');
		} catch {
			return dateInput;
		}
	}

	openDrawer(workoutRecord?: WorkoutRecord): void {
		this.selectedWorkoutRecord = workoutRecord ?? null;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.getAllWorkoutRecords();
	}

	getWorkoutName(workoutId: string): string {
		return this._allWorkouts.find((w) => w._id === workoutId)?.name ?? '—';
	}

	getAllWorkouts() {
		this.workoutsLoading = true;
		this.workoutService.getAllWorkouts().subscribe((workouts) => {
			this._allWorkouts = workouts;
			this.workoutsLoading = false;
		});
	}

	getAllWorkoutRecords(): void {
		this.workoutRecordsLoading = true;
		this.workoutRecordService.getAllWorkoutRecords().subscribe((records) => {
			this._allWorkoutRecords = records;
			this.workoutRecordsLoading = false;
		});
	}

	deleteWorkoutRecord(record: WorkoutRecord): void {
		this.workoutRecordService.deleteWorkoutRecord(record._id).subscribe(() => {
			this.getAllWorkoutRecords();
		});
	}
}
