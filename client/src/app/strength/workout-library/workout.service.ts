import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Workout } from '../models/Workout';
import { environment } from '../../../environments/environment';

@Injectable()
export class WorkoutService {
	constructor(private http: HttpClient) {}

	createWorkout(workout: Workout): Observable<Workout> {
		return this.http.post<Workout>(`${environment.baseApiUrl}/strength/workout`, workout);
	}

	updateWorkout(workoutId: string, workout: Workout): Observable<Workout> {
		return this.http.put<Workout>(`${environment.baseApiUrl}/strength/workout/${workoutId}`, workout);
	}

	getAllWorkouts(): Observable<Array<Workout>> {
		const userId = localStorage.getItem('id');
		return this.http.get<Array<Workout>>(`${environment.baseApiUrl}/strength/workout/${userId}`);
	}

	getWorkoutById(workoutId: string): Observable<Workout> {
		return this.http.get<Workout>(`${environment.baseApiUrl}/strength/workout/${workoutId}`);
	}

	deleteWorkout(workoutId: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/strength/workout/${workoutId}`);
	}
}

