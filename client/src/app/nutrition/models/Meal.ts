import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class Meal {
	name: string;
	calories: number;
	fat: number;
	protein: number;
	carbs: number;
	description: string;

	constructor(meal?: Partial<Meal>) {
		this.name = meal?.name || '';
		this.calories = meal?.calories ?? 0;
		this.fat = meal?.fat ?? 0;
		this.protein = meal?.protein ?? 0;
		this.carbs = meal?.carbs ?? 0;
		this.description = meal?.description || '';
	}

	static createFormGroup(fb: FormBuilder, meal?: Meal): FormGroup {
		return fb.group({
			name: [meal?.name || '', Validators.required],
			calories: [meal?.calories ?? 0, [Validators.required, Validators.min(0)]],
			fat: [meal?.fat ?? 0, [Validators.required, Validators.min(0)]],
			protein: [meal?.protein ?? 0, [Validators.required, Validators.min(0)]],
			carbs: [meal?.carbs ?? 0, [Validators.required, Validators.min(0)]],
			description: [meal?.description || ''],
		});
	}
}

