import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private _apiUrl = `${environment.baseApiUrl}/user`;

	// ── Nutrition feature flag ────────────────────────────────────────────────
	// Single source of truth — all components subscribe to this instead of
	// reading nutritionEnabled off the one-time user GET response.
	private _nutritionEnabled$ = new BehaviorSubject<boolean>(true);
	readonly nutritionEnabled$ = this._nutritionEnabled$.asObservable();

	constructor(private http: HttpClient) {}

	getUser(id: string): Observable<UserProfile> {
		return this.http.get<UserProfile>(`${this._apiUrl}/${id}`).pipe(
			tap(user => this._nutritionEnabled$.next(user.nutritionEnabled !== false))
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

	/** Push a new nutrition-enabled state to all subscribers without an HTTP call.
	 *  Used by GlobalSettingsComponent for optimistic updates and error reverting. */
	setNutritionEnabled(enabled: boolean): void {
		this._nutritionEnabled$.next(enabled);
	}
}
