import { WeekPlan, WeekPlanDTO } from './models/WeekPlan';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class WeekPlannerService {
	constructor(private http: HttpClient) {}

	getWeekPlanByWeek(userId: string, weekStart: string): Observable<WeekPlan | null> {
		return this.http.get<WeekPlan | null>(`${environment.baseApiUrl}/week-planner/week/${userId}/${weekStart}`);
	}

	upsertWeekPlan(plan: WeekPlanDTO): Observable<WeekPlan> {
		return this.http.post<WeekPlan>(`${environment.baseApiUrl}/week-planner/week/upsert`, plan);
	}

	copyWeek(userId: string, fromWeekStart: string, toWeekStart: string): Observable<WeekPlan> {
		return this.http.post<WeekPlan>(`${environment.baseApiUrl}/week-planner/week/copy`, { userId, fromWeekStart, toWeekStart });
	}

	createWeekPlan(week: WeekPlanDTO): Observable<WeekPlan> {
		return this.http.post<WeekPlan>(`${environment.baseApiUrl}/week-planner/week`, week);
	}

	updateWeekPlan(weekId: string, week: WeekPlanDTO): Observable<WeekPlan> {
		return this.http.put<WeekPlan>(`${environment.baseApiUrl}/week-planner/week/${weekId}`, week);
	}

	deleteWeekPlan(weekId: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/week-planner/week/${weekId}`);
	}
}
