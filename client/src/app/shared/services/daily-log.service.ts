import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyLog } from '../../nutrition/models/DailyLog';
import { environment } from '../../../environments/environment';

@Injectable()
export class DailyLogService {
	private base = `${environment.baseApiUrl}/nutrition/daily-log`;

	constructor(private http: HttpClient) {}

	getLog(userId: string, date: string): Observable<DailyLog | null> {
		return this.http.get<DailyLog | null>(`${this.base}/${userId}/${date}`);
	}

	createLog(log: Partial<DailyLog>): Observable<DailyLog> {
		return this.http.post<DailyLog>(this.base, log);
	}

	updateLog(id: string, log: Partial<DailyLog>): Observable<DailyLog> {
		return this.http.put<DailyLog>(`${this.base}/${id}`, log);
	}
}
