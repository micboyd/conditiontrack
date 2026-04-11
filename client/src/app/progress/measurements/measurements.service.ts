import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Measurement } from '../models/Measurement';

@Injectable()
export class MeasurementsService {
	private base = `${environment.baseApiUrl}/progress/measurements`;

	constructor(private http: HttpClient) {}

	getAll(userId: string): Observable<Measurement[]> {
		return this.http.get<Measurement[]>(`${this.base}/${userId}`);
	}

	create(m: Partial<Measurement>): Observable<Measurement> {
		return this.http.post<Measurement>(this.base, m);
	}

	update(id: string, m: Partial<Measurement>): Observable<Measurement> {
		return this.http.put<Measurement>(`${this.base}/${id}`, m);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}
}
