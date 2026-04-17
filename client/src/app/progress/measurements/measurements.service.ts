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

	create(payload: Partial<Measurement>, photo?: File): Observable<Measurement> {
		const fd = this.toFormData(payload);
		if (photo) fd.append('photo', photo);
		return this.http.post<Measurement>(this.base, fd);
	}

	update(id: string, payload: Partial<Measurement>, photo?: File, removePhoto = false): Observable<Measurement> {
		const fd = this.toFormData(payload);
		if (photo) fd.append('photo', photo);
		if (removePhoto) fd.append('removePhoto', 'true');
		return this.http.put<Measurement>(`${this.base}/${id}`, fd);
	}

	delete(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}

	private toFormData(payload: Partial<Measurement>): FormData {
		const fd = new FormData();
		const numOrNull = (v: number | null | undefined) =>
			v !== null && v !== undefined ? String(v) : 'null';

		if (payload.userId)   fd.append('userId',     payload.userId);
		if (payload.date)     fd.append('date',        payload.date);
		fd.append('weight',     numOrNull(payload.weight));
		fd.append('muscleMass', numOrNull(payload.muscleMass));
		fd.append('bodyFat',    numOrNull(payload.bodyFat));
		fd.append('notes',      payload.notes ?? '');
		return fd;
	}
}
