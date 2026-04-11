import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TrainingBlock } from './models/TrainingBlock';

@Injectable()
export class TrainingBlocksService {
	private base = `${environment.baseApiUrl}/training-blocks/training-block`;

	constructor(private http: HttpClient) {}

	getAllBlocks(): Observable<TrainingBlock[]> {
		const userId = localStorage.getItem('id');
		return this.http.get<TrainingBlock[]>(`${this.base}/${userId}`);
	}

	createBlock(block: Partial<TrainingBlock>): Observable<TrainingBlock> {
		return this.http.post<TrainingBlock>(this.base, block);
	}

	updateBlock(id: string, block: Partial<TrainingBlock>): Observable<TrainingBlock> {
		return this.http.put<TrainingBlock>(`${this.base}/${id}`, block);
	}

	deleteBlock(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}
}
