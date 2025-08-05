import { Component, OnInit } from '@angular/core';

import { Meal } from '../models/Meal';
import { MealLibraryService } from './meal-library.service';

@Component({
	selector: 'app-meal-library',
	templateUrl: './meal-library.component.html',
	standalone: false,
})
export class MealLibraryComponent implements OnInit {
	mealsLoading: boolean = false;
	selectedMeal: Meal | null = null;
	private _allMeals: Array<Meal> = [];
	editModeEnabled: boolean = false;

	constructor(public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.getAllMeals();
	}

	get allMeals(): Array<Meal> {
		return this._allMeals;
	}

	openEditMode(meal: Meal | null): void {
        this.selectedMeal = meal ?? null;
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.getAllMeals();
		this.editModeEnabled = false;
	}

	getAllMeals(): void {
        this.mealsLoading = true;
		this.mealService.getAllMeals().subscribe(allMeals => {
			this._allMeals = allMeals;
            this.mealsLoading = false;
		});
	}

	deleteMeal(meal: Meal): void {
        this.mealsLoading = true;
		this.mealService.deleteMeal(meal._id).subscribe(() => {
			this.getAllMeals();
            this.mealsLoading = false;
		});
	}
}
