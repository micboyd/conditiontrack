import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeekTemplate, WeekTemplateDTO } from './models/WeekTemplate';
import { WeekPlan } from './models/WeekPlan';

@Injectable()
export class WeekTemplateService {
	constructor(private http: HttpClient) {}

	getTemplates(userId: string): Observable<WeekTemplate[]> {
		return this.http.get<WeekTemplate[]>(`${environment.baseApiUrl}/week-planner/template/${userId}`);
	}

	getTemplate(id: string): Observable<WeekTemplate> {
		return this.http.get<WeekTemplate>(`${environment.baseApiUrl}/week-planner/template/single/${id}`);
	}

	createTemplate(dto: WeekTemplateDTO): Observable<WeekTemplate> {
		return this.http.post<WeekTemplate>(`${environment.baseApiUrl}/week-planner/template`, dto);
	}

	updateTemplate(id: string, dto: WeekTemplateDTO): Observable<WeekTemplate> {
		return this.http.put<WeekTemplate>(`${environment.baseApiUrl}/week-planner/template/${id}`, dto);
	}

	deleteTemplate(id: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/week-planner/template/${id}`);
	}

	applyTemplate(userId: string, templateId: string, weekStart: string): Observable<WeekPlan> {
		return this.http.post<WeekPlan>(`${environment.baseApiUrl}/week-planner/template/apply`, { userId, templateId, weekStart });
	}
}
