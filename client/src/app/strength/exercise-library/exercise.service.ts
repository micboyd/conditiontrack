import { Exercise } from '../models/Exercise';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ExerciseService {
	constructor(private http: HttpClient) {}

	createExercise(exercise: Exercise): Observable<Exercise> {
		return this.http.post<Exercise>(`${environment.baseApiUrl}/strength/exercise`, exercise);
	}

	updateExercise(exerciseId: string, exercise: Exercise): Observable<Exercise> {
		return this.http.put<Exercise>(`${environment.baseApiUrl}/strength/exercise/${exerciseId}`, exercise);
	}

	getAllExercises(): Observable<Array<Exercise>> {
		const userId = localStorage.getItem('id');
		return this.http.get<Array<Exercise>>(`${environment.baseApiUrl}/strength/exercise/${userId}`);
	}

	getExerciseById(exerciseId: string): Observable<Exercise> {
		return this.http.get<Exercise>(`${environment.baseApiUrl}/strength/exercise/${exerciseId}`);
	}

	deleteExercise(exerciseId: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/strength/exercise/${exerciseId}`);
	}
}

