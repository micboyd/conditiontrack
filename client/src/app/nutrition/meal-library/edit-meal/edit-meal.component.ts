import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Meal } from '../../models/Meal';
import { MealLibraryService } from '../meal-library.service';

@Component({
	selector: 'app-edit-meal',
	templateUrl: './edit-meal.component.html',
	standalone: false,
})
export class EditMealComponent implements OnInit, OnChanges {
	mealForm!: FormGroup;
	formLoading = false;

	@Input() selectedMeal: Meal | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	selectedMealTypes: string[] = [];
	entryMode: 'manual' | 'scan' = 'manual';
	scanLoading = false;
	scanError: string | null = null;

	constructor(private fb: FormBuilder, public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedMeal']) {
			this.initForm();
		}
	}

	categoriesInvalid = false;

	private initForm(): void {
		this.mealForm = Meal.createFormGroup(this.fb, this.selectedMeal ?? new Meal(null));
		this.selectedMealTypes = this.selectedMeal?.categories?.length
			? [...this.selectedMeal.categories]
			: [];
		this.categoriesInvalid = false;
	}

	updateCategory(event: string[]): void {
		this.selectedMealTypes = event;
		this.categoriesInvalid = false;
	}

	isInvalid(controlName: string): boolean {
		const control = this.mealForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	onScanFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		this.scanLoading = true;
		this.scanError = null;
		this.mealService.scanNutritionLabel(file).subscribe({
			next: (macros) => {
				this.mealForm.patchValue(macros);
				this.scanLoading = false;
			},
			error: (err) => {
				this.scanError = err?.error?.error ?? 'Could not read label. Try a clearer photo.';
				this.scanLoading = false;
			},
		});
	}

	onSubmit(): void {
		this.mealForm.markAllAsTouched();
		this.categoriesInvalid = this.selectedMealTypes.length === 0;
		if (this.mealForm.invalid || this.categoriesInvalid) return;

		const payload = { ...this.mealForm.value, categories: this.selectedMealTypes };
		this.formLoading = true;
		if (this.selectedMeal) {
			this.mealService.updateMeal(this.selectedMeal._id, payload).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		} else {
			this.mealService.createMeal(payload).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}
}
