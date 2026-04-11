import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
	_id: string;
	firstname: string;
	lastname: string;
	username: string;
	profileImage?: string;
	bio?: string;
	createdAt?: string;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private _apiUrl = `${environment.baseApiUrl}/user`;

	constructor(private http: HttpClient) {}

	getUser(id: string): Observable<UserProfile> {
		return this.http.get<UserProfile>(`${this._apiUrl}/${id}`);
	}

	updateUser(id: string, formData: FormData): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, formData);
	}
}
