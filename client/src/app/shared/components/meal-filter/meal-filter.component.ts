import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface MealFilterValue {
	search: string;
	category: string;
	calorieMin: number | null;
	calorieMax: number | null;
}

@Component({
	selector: 'app-meal-filter',
	templateUrl: './meal-filter.component.html',
	standalone: false,
})
export class MealFilterComponent implements OnInit, OnDestroy {
	@Output() filterChange = new EventEmitter<MealFilterValue>();

	readonly categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

	searchQuery = '';
	selectedCategory = '';
	calorieMinInput: number | null = null;
	calorieMaxInput: number | null = null;
	calorieMin: number | null = null;
	calorieMax: number | null = null;

	private searchSubject = new Subject<string>();
	private sub!: Subscription;

	ngOnInit(): void {
		this.sub = this.searchSubject.pipe(
			debounceTime(300),
			distinctUntilChanged(),
		).subscribe(() => this.emit());
	}

	ngOnDestroy(): void {
		this.sub?.unsubscribe();
	}

	onSearchInput(value: string): void {
		this.searchQuery = value;
		this.searchSubject.next(value);
	}

	setCategory(category: string): void {
		this.selectedCategory = category;
		this.emit();
	}

	applyCalorieRange(): void {
		this.calorieMin = this.calorieMinInput;
		this.calorieMax = this.calorieMaxInput;
		this.emit();
	}

	clearCalorieRange(): void {
		this.calorieMinInput = null;
		this.calorieMaxInput = null;
		this.calorieMin = null;
		this.calorieMax = null;
		this.emit();
	}

	get calorieRangeActive(): boolean {
		return this.calorieMin != null || this.calorieMax != null;
	}

	private emit(): void {
		this.filterChange.emit({
			search: this.searchQuery,
			category: this.selectedCategory,
			calorieMin: this.calorieMin,
			calorieMax: this.calorieMax,
		});
	}
}
