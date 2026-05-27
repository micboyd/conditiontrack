import { ConditioningSession } from '../models/ConditioningSession';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ConditioningLibraryService {
    constructor(private http: HttpClient) {}

    createConditioningSession(conditioningSession: ConditioningSession): Observable<ConditioningSession> {
        return this.http.post<ConditioningSession>(`${environment.baseApiUrl}/conditioning/conditioning-session`, conditioningSession);
    }

    updateConditioningSession(conditioningSessionId: string, conditioningSession: ConditioningSession): Observable<ConditioningSession> {
        return this.http.put<ConditioningSession>(`${environment.baseApiUrl}/conditioning/conditioning-session/${conditioningSessionId}`, conditioningSession);
    }

    getAllConditioningSessions(q?: string): Observable<Array<ConditioningSession>> {
        const userId = localStorage.getItem('id');
        const params = q ? { params: { q } } : {};
        return this.http.get<Array<ConditioningSession>>(`${environment.baseApiUrl}/conditioning/conditioning-session/${userId}`, params);
    }

    getConditioningSessionById(conditioningSessionId: string): Observable<ConditioningSession> {
        return this.http.get<ConditioningSession>(`${environment.baseApiUrl}/conditioning/conditioning-session/${conditioningSessionId}`);
    }

    deleteConditioningSession(conditioningSessionId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}/conditioning/conditioning-session/${conditioningSessionId}`);
    }
}

