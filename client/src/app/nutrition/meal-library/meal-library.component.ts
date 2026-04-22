import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Meal } from '../models/Meal';
import { MealLibraryService } from './meal-library.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-meal-library',
	templateUrl: './meal-library.component.html',
	standalone: false,
})
export class MealLibraryComponent implements OnInit, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	loading = false;
	selectedMeal: Meal | null = null;
	drawerOpen = false;
	private _allMeals: Meal[] = [];

	// Filter state
	searchQuery = '';
	selectedCategory = '';
	calorieMin: number | null = null;
	calorieMax: number | null = null;
	calorieMinInput: number | null = null;
	calorieMaxInput: number | null = null;

	// Pagination state
	currentPage = 1;
	totalPages = 1;
	total = 0;
	readonly pageSize = 10;

	readonly categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

	private searchSubject = new Subject<string>();
	private searchSub!: Subscription;

	constructor(public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.searchSub = this.searchSubject.pipe(
			debounceTime(300),
			distinctUntilChanged(),
		).subscribe(() => {
			this.currentPage = 1;
			this.loadMeals();
		});
		this.loadMeals();
	}

	ngOnDestroy(): void {
		this.searchSub?.unsubscribe();
	}

	get allMeals(): Meal[] {
		return this._allMeals;
	}

	get pages(): number[] {
		return Array.from({ length: this.totalPages }, (_, i) => i + 1);
	}

	loadMeals(): void {
		this.loading = true;
		this.mealService.searchMeals({
			search: this.searchQuery || undefined,
			category: this.selectedCategory || undefined,
			calorieMin: this.calorieMin,
			calorieMax: this.calorieMax,
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

	onSearchInput(value: string): void {
		this.searchQuery = value;
		this.searchSubject.next(value);
	}

	setCategory(category: string): void {
		this.selectedCategory = category;
		this.currentPage = 1;
		this.loadMeals();
	}

	applyCalorieRange(): void {
		this.calorieMin = this.calorieMinInput;
		this.calorieMax = this.calorieMaxInput;
		this.currentPage = 1;
		this.loadMeals();
	}

	clearCalorieRange(): void {
		this.calorieMinInput = null;
		this.calorieMaxInput = null;
		this.calorieMin = null;
		this.calorieMax = null;
		this.currentPage = 1;
		this.loadMeals();
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
