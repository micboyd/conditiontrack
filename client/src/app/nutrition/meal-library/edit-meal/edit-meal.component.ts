import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Meal } from '../../models/Meal';
import { MealLibraryService } from '../meal-library.service';

@Component({
	selector: 'app-edit-meal',
	templateUrl: './edit-meal.component.html',
	standalone: false,
})
export class EditMealComponent implements OnInit {
	mealForm!: FormGroup;
	formLoading = false;

	@Input() selectedMeal: Meal | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	selectedMealTypes: string[] = [];

	constructor(private fb: FormBuilder, public mealService: MealLibraryService) {}

	ngOnInit(): void {
		this.mealForm = Meal.createFormGroup(this.fb, this.selectedMeal ?? new Meal(null));
		this.selectedMealTypes = this.selectedMeal?.category ? [this.selectedMeal.category] : [];
	}

	updateCategory(event: string[]): void {
		this.selectedMealTypes = event;
		this.mealForm.get('category')?.setValue(event[0] ?? '');
		this.mealForm.get('category')?.markAsTouched();
	}

	isInvalid(controlName: string): boolean {
		const control = this.mealForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	onSubmit(): void {
		this.mealForm.markAllAsTouched();
		if (this.mealForm.invalid) return;

		this.formLoading = true;
		if (this.selectedMeal) {
			this.mealService.updateMeal(this.selectedMeal._id, this.mealForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		} else {
			this.mealService.createMeal(this.mealForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}
}
