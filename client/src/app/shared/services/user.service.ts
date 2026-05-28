import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FeatureFlagsService } from './feature-flags.service';

export interface MacroGoals {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
}

export interface UserProfile {
	_id: string;
	firstname: string;
	lastname: string;
	username: string;
	profileImage?: string;
	bio?: string;
	createdAt?: string;
	macroGoals?: MacroGoals;
	bmr?: number;
	dailyDeficitTarget?: number;
	nutritionEnabled?: boolean;
	// Future module toggles: goalsEnabled?: boolean; progressEnabled?: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private _apiUrl = `${environment.baseApiUrl}/user`;

	constructor(
		private http: HttpClient,
		private featureFlags: FeatureFlagsService,
	) {}

	/** Fetches user and automatically syncs all feature flags via FeatureFlagsService. */
	getUser(id: string): Observable<UserProfile> {
		return this.http.get<UserProfile>(`${this._apiUrl}/${id}`).pipe(
			tap(user => this.featureFlags.initFromUser(user))
		);
	}

	updateUser(id: string, formData: FormData): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, formData);
	}

	updateMacroGoals(id: string, macroGoals: MacroGoals): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, { macroGoals });
	}

	updateBmr(id: string, bmr: number): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, { bmr });
	}

	updateDailyDeficitTarget(id: string, dailyDeficitTarget: number): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, { dailyDeficitTarget });
	}

	updateNutritionEnabled(id: string, enabled: boolean): Observable<UserProfile> {
		return this.http.put<UserProfile>(`${this._apiUrl}/${id}`, { nutritionEnabled: enabled });
	}
}
