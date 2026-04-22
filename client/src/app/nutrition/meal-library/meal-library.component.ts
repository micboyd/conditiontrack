import { Component, OnInit, ViewChild } from '@angular/core';

import { Meal } from '../models/Meal';
import { MealFilterValue } from '../../shared/components/meal-filter/meal-filter.component';
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

	// Pagination state
	currentPage = 1;
	totalPages = 1;
	total = 0;
	readonly pageSize = 10;

	private currentFilter: MealFilterValue = { search: '', category: '', calorieMin: null, calorieMax: null };

	constructor(public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.loadMeals();
	}

	get allMeals(): Meal[] {
		return this._allMeals;
	}

	get pages(): number[] {
		return Array.from({ length: this.totalPages }, (_, i) => i + 1);
	}

	get hasActiveFilters(): boolean {
		const f = this.currentFilter;
		return !!(f.search || f.category || f.calorieMin != null || f.calorieMax != null);
	}

	onFilterChange(filter: MealFilterValue): void {
		this.currentFilter = filter;
		this.currentPage = 1;
		this.loadMeals();
	}

	loadMeals(): void {
		const f = this.currentFilter;
		this.loading = true;
		this.mealService.searchMeals({
			search: f.search || undefined,
			category: f.category || undefined,
			calorieMin: f.calorieMin,
			calorieMax: f.calorieMax,
			page: this.currentPage,
			limit: this.pageSize,
		}).subscribe({
			next: (res) => {
				this._allMeals = res.meals;
				this.total = res.total;
				this.totalPages = res.totalPages;
				this.loading = false;
			},
			error: () => { this.loading = false; },
		});
	}

	goToPage(page: number): void {
		if (page < 1 || page > this.totalPages) return;
		this.currentPage = page;
		this.loadMeals();
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
		this.loadMeals();
	}

	deleteMeal(meal: Meal): void {
		this.mealService.deleteMeal(meal._id).subscribe(() => {
			this.loadMeals();
		});
	}
}
