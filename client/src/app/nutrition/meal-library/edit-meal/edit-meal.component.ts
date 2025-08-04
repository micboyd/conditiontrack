import { Component } from '@angular/core';
import { Meal } from '../../models/Meal';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-edit-meal',
	templateUrl: './edit-meal.component.html',
	standalone: false,
})
export class EditMealComponent {
	mealForm: FormGroup;

	@Output() closeEditModeEvent = new EventEmitter<void>();

	constructor(private fb: FormBuilder) {
		const meal = new Meal({
			name: 'Grilled Chicken Salad',
			calories: 350,
			fat: 10,
			protein: 30,
			carbs: 20,
			description: 'A healthy grilled chicken salad with greens and vinaigrette.',
		});

		this.mealForm = Meal.createFormGroup(this.fb, meal);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	isInvalid(controlName: string): boolean {
		const control = this.mealForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	onSubmit() {
		if (this.mealForm.valid) {
			const submittedMeal = new Meal(this.mealForm.value);
			console.log('Submitted:', submittedMeal);
		}
	}
}

