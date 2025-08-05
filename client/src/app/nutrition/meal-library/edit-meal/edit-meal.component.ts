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
    formLoading: boolean = false;

    @Input() selectedMeal: Meal | null = null;

	selectedMealTypes: string[] = [];
	selectedDietType: string[] = [];
	@Output() closeEditModeEvent = new EventEmitter<void>();

	constructor(private fb: FormBuilder, public mealService: MealLibraryService) {}

    ngOnInit(): void {
		this.mealForm = Meal.createFormGroup(this.fb, this.selectedMeal?? new Meal(null));
        this.setSelectedMealType();
    }

    setSelectedMealType() {
        this.selectedMealTypes = this.mealForm.get('category')?.value;
    }

    updateCategory(event: string[]) {
        this.selectedMealTypes = event;
        this.mealForm.get('category')?.setValue(event[0]);
        console.log(this.mealForm.value);
    }

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	isInvalid(controlName: string): boolean {
		const control = this.mealForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	toggleSelection(type: string) {
		if (this.selectedMealTypes.includes(type)) {
			this.selectedMealTypes = this.selectedMealTypes.filter(t => t !== type);
		} else {
			this.selectedMealTypes.push(type);
		}
	}

	isSelected(type: string): boolean {
		return this.selectedMealTypes.includes(type);
	}

	onSubmit(): void {
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

