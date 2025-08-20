import { WeekPlan, WeekPlanDTO } from './models/WeekPlan';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

WeekPlan

@Injectable()
export class WeekPlannerService {
    constructor(private http: HttpClient) {}

    createWeekPlan(week: WeekPlanDTO): Observable<WeekPlan> {
        return this.http.post<WeekPlan>(`${environment.baseApiUrl}/week-planner/week`, week);
    }

    updateWeekPlan(weekId: string, week: WeekPlanDTO): Observable<WeekPlan> {
        return this.http.put<WeekPlan>(`${environment.baseApiUrl}/week-planner/week/${weekId}`, week);
    }

    getAllWeekPlans(): Observable<Array<WeekPlan>> {
        const userId = localStorage.getItem('id');
        return this.http.get<Array<WeekPlan>>(`${environment.baseApiUrl}/week-planner/week/${userId}`);
    }

    getWeekPlanById(weekId: string): Observable<WeekPlan> {
        return this.http.get<WeekPlan>(`${environment.baseApiUrl}/week-planner/week/${weekId}`);
    }

    deleteWeekPlan(weekId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}/week-planner/week/${weekId}`);
    }
}

