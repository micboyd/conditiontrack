import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgressPhoto } from '../models/ProgressPhoto';
import { environment } from '../../../environments/environment';

@Injectable()
export class ProgressPhotosService {
    constructor(private http: HttpClient) {}

    getAllPhotos(userId: string): Observable<ProgressPhoto[]> {
        return this.http.get<ProgressPhoto[]>(`${environment.baseApiUrl}/progress/photos/${userId}`);
    }

    uploadPhoto(formData: FormData): Observable<ProgressPhoto> {
        return this.http.post<ProgressPhoto>(`${environment.baseApiUrl}/progress/photos`, formData);
    }

    deletePhoto(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.baseApiUrl}/progress/photos/${id}`);
    }
}
