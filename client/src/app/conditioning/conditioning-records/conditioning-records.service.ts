import { ConditioningRecord } from '../models/ConditioningRecord';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ConditioningRecordService {
    constructor(private http: HttpClient) {}

    createConditioningRecord(conditioningRecord: ConditioningRecord): Observable<ConditioningRecord> {
        return this.http.post<ConditioningRecord>(`${environment.baseApiUrl}/conditioning/conditioning-record`, conditioningRecord);
    }

    updateConditioningRecord(conditioningRecordId: string, conditioningRecord: ConditioningRecord): Observable<ConditioningRecord> {
        return this.http.put<ConditioningRecord>(`${environment.baseApiUrl}/conditioning/conditioning-record/${conditioningRecordId}`, conditioningRecord);
    }

    getAllConditioningRecords(): Observable<Array<ConditioningRecord>> {
        const userId = localStorage.getItem('id');
        return this.http.get<Array<ConditioningRecord>>(`${environment.baseApiUrl}/conditioning/conditioning-record/${userId}`);
    }

    getConditioningRecordById(conditioningRecordId: string): Observable<ConditioningRecord> {
        return this.http.get<ConditioningRecord>(`${environment.baseApiUrl}/conditioning/conditioning-record/${conditioningRecordId}`);
    }

    deleteConditioningRecord(conditioningRecordId: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}/conditioning/conditioning-record/${conditioningRecordId}`);
    }
}

