import { Component, OnInit, ViewChild } from '@angular/core';

import { Meal } from '../models/Meal';
import { MealLibraryService } from './meal-library.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-meal-library',
	templateUrl: './meal-library.component.html',
	standalone: false,
})
export class MealLibraryComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	loading = false;
	selectedMeal: Meal | null = null;
	drawerOpen = false;
	private _allMeals: Meal[] = [];

	constructor(public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.getAllMeals();
	}

	get allMeals(): Meal[] {
		return this._allMeals;
	}

	openDrawer(meal: Meal | null): void {
		this.selectedMeal = meal;
		this.drawerOpen = true;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawerOpen = false;
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.drawerOpen = false;
		this.getAllMeals();
	}

	getAllMeals(): void {
		this.loading = true;
		this.mealService.getAllMeals().subscribe((meals) => {
			this._allMeals = meals;
			this.loading = false;
		});
	}

	deleteMeal(meal: Meal): void {
		this.mealService.deleteMeal(meal._id).subscribe(() => {
			this.getAllMeals();
		});
	}
}
