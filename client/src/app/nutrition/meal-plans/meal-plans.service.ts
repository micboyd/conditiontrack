import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MealPlan } from '../models/MealPlan';
import { environment } from '../../../environments/environment';

@Injectable()
export class MealPlansService {
	private base = `${environment.baseApiUrl}/nutrition/meal-plan`;

	constructor(private http: HttpClient) {}

	getPlanByWeek(userId: string, weekStart: string): Observable<MealPlan | null> {
		return this.http.get<MealPlan | null>(`${this.base}/${userId}/${weekStart}`);
	}

	savePlan(plan: MealPlan): Observable<MealPlan> {
		return this.http.post<MealPlan>(`${this.base}/upsert`, plan);
	}

	deletePlan(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}

	copyWeek(userId: string, fromWeekStart: string, toWeekStart: string): Observable<MealPlan> {
		return this.http.post<MealPlan>(`${this.base}/copy`, { userId, fromWeekStart, toWeekStart });
	}
}
