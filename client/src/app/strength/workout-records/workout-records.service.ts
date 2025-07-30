import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkoutRecord } from '../models/WorkoutRecord';
import { environment } from '../../../../environments/environment';

@Injectable()
export class WorkoutRecordService {
	constructor(private http: HttpClient) {}

	createWorkoutRecord(workoutRecord: WorkoutRecord): Observable<WorkoutRecord> {
		return this.http.post<WorkoutRecord>(`${environment.baseApiUrl}/strength/workout-record`, workoutRecord);
	}

	updateWorkoutRecord(workoutRecordId: string, workoutRecord: WorkoutRecord): Observable<WorkoutRecord> {
		return this.http.put<WorkoutRecord>(`${environment.baseApiUrl}/strength/workout-record/${workoutRecordId}`, workoutRecord);
	}

	getAllWorkoutRecords(): Observable<Array<WorkoutRecord>> {
		const userId = localStorage.getItem('id');
		return this.http.get<Array<WorkoutRecord>>(`${environment.baseApiUrl}/strength/workout-record/${userId}`);
	}

	getWorkoutRecordById(workoutRecordId: string): Observable<WorkoutRecord> {
		return this.http.get<WorkoutRecord>(`${environment.baseApiUrl}/strength/workout-record/${workoutRecordId}`);
	}

	deleteWorkoutRecord(workoutRecordId: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/strength/workout-record/${workoutRecordId}`);
	}
}
