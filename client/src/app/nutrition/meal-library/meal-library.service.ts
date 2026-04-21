import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Meal } from '../models/Meal';
import { Observable } from 'rxjs';
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
		return this.http.get<Array<Meal>>(`${environment.baseApiUrl}/nutrition/meal/user/${userId}`);
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

