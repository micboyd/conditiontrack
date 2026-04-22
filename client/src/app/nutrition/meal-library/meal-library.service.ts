import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Meal } from '../models/Meal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class MealLibraryService {
	constructor(private http: HttpClient) {}

	createMeal(meal: Meal): Observable<Meal> {
		const userId = localStorage.getItem('id');
		return this.http.post<Meal>(`${environment.baseApiUrl}/nutrition/meal`, { ...meal, userId });
	}

	updateMeal(mealId: string, meal: Meal): Observable<Meal> {
		return this.http.put<Meal>(`${environment.baseApiUrl}/nutrition/meal/${mealId}`, meal);
	}

	getAllMeals(): Observable<Array<Meal>> {
		const userId = localStorage.getItem('id');
		const params = new HttpParams().set('limit', '10000');
		return this.http.get<{ meals: Meal[] }>(
			`${environment.baseApiUrl}/nutrition/meal/user/${userId}`, { params }
		).pipe(map(res => res.meals));
	}

	searchMeals(params: {
		search?: string;
		category?: string;
		calorieMin?: number | null;
		calorieMax?: number | null;
		page?: number;
		limit?: number;
	}): Observable<{ meals: Meal[]; total: number; page: number; totalPages: number }> {
		const userId = localStorage.getItem('id');
		let httpParams = new HttpParams();
		if (params.search) httpParams = httpParams.set('search', params.search);
		if (params.category) httpParams = httpParams.set('category', params.category);
		if (params.calorieMin != null) httpParams = httpParams.set('calorieMin', String(params.calorieMin));
		if (params.calorieMax != null) httpParams = httpParams.set('calorieMax', String(params.calorieMax));
		if (params.page != null) httpParams = httpParams.set('page', String(params.page));
		if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
		return this.http.get<{ meals: Meal[]; total: number; page: number; totalPages: number }>(
			`${environment.baseApiUrl}/nutrition/meal/user/${userId}`,
			{ params: httpParams }
		);
	}

	getMealById(mealId: string): Observable<Meal> {
		return this.http.get<Meal>(`${environment.baseApiUrl}/nutrition/meal/${mealId}`);
	}

	deleteMeal(mealId: string): Observable<void> {
		return this.http.delete<void>(`${environment.baseApiUrl}/nutrition/meal/${mealId}`);
	}

	scanNutritionLabel(file: File): Observable<{ calories: number; protein: number; carbs: number; fat: number }> {
		const formData = new FormData();
		formData.append('image', file);
		return this.http.post<{ calories: number; protein: number; carbs: number; fat: number }>(
			`${environment.baseApiUrl}/nutrition/meal/scan-label`, formData
		);
	}
}

