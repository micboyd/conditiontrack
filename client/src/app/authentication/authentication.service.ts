import { AuthUser } from '../shared/models/AuthUser';
import { HttpClient } from '@angular/common/http';
import { IJWTPayload } from '../shared/interfaces/IJWTPayload';
import { Injectable } from '@angular/core';
import { LoginRequest } from '../shared/models/LoginRequest';
import { LoginResponse } from '../shared/models/LoginResponse';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private _apiUrl = `${environment.baseApiUrl}/auth`;

	constructor(private http: HttpClient) {}

	setDetails(loginDetails: LoginResponse) {
		localStorage.setItem('id', loginDetails.id);
		localStorage.setItem('token', loginDetails.token);
	}

	login(payload: LoginRequest): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this._apiUrl}/login`, payload);
	}

	register(payload: AuthUser): Observable<string> {
		return this.http.post<string>(`${this._apiUrl}/register`, payload);
	}

	clearDetails() {
		localStorage.clear();
	}

	getToken(): string {
		return localStorage.getItem('token') ?? '';
	}

	isTokenExpired(token: string): boolean {
		try {
			const decoded = jwtDecode<IJWTPayload>(token);
			const currentTime = Math.floor(Date.now() / 1000);

			return decoded.exp < currentTime;
		} catch (error) {
			return true;
		}
	}

	isAuthenticated(): boolean {
		const token = this.getToken();

		if (!token) {
			return false;
		} else {
			return !this.isTokenExpired(token);
		}
	}
}

