import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MacroGoals, UserService } from '../shared/services/user.service';
import { SelectOption } from '../shared/components/select/select.component';

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
	sedentary: 1.2,
	light: 1.375,
	moderate: 1.55,
	active: 1.725,
	veryActive: 1.9,
};

const GENDER_OPTIONS: SelectOption[] = [
	{ value: 'male',   label: 'Male' },
	{ value: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS: SelectOption[] = [
	{ value: 'sedentary',  label: 'Sedentary (little or no exercise)' },
	{ value: 'light',      label: 'Lightly Active (1–3 days/week)' },
	{ value: 'moderate',   label: 'Moderately Active (3–5 days/week)' },
	{ value: 'active',     label: 'Very Active (6–7 days/week)' },
	{ value: 'veryActive', label: 'Extra Active (physical job or 2× training)' },
];

@Component({
	selector: 'app-global-settings',
	templateUrl: './global-settings.component.html',
	standalone: false,
})
export class GlobalSettingsComponent implements OnInit {
	readonly genderOptions = GENDER_OPTIONS;
	readonly activityOptions = ACTIVITY_OPTIONS;
	form!: FormGroup;
	loading = false;
	saving = false;
	saved = false;

	bmrForm!: FormGroup;
	calculatedBmr: number | null = null;
	savedBmr: number | null = null;
	bmrSaving = false;
	bmrSaved = false;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
	) {}

	ngOnInit(): void {
		this.form = this.fb.group({
			calories: [0, [Validators.min(0)]],
			protein:  [0, [Validators.min(0)]],
			carbs:    [0, [Validators.min(0)]],
			fat:      [0, [Validators.min(0)]],
		});

		this.bmrForm = this.fb.group({
			gender:        ['male'],
			age:           [null, [Validators.min(1), Validators.max(120)]],
			weight:        [null, [Validators.min(1)]],
			height:        [null, [Validators.min(1)]],
			activityLevel: ['sedentary'],
		});

		this.bmrForm.valueChanges.subscribe(() => this.recalcBmr());

		const id = localStorage.getItem('id') ?? '';
		this.loading = true;
		this.userService.getUser(id).subscribe({
			next: user => {
				if (user.macroGoals) {
					this.form.patchValue(user.macroGoals);
				}
				if (user.bmr) {
					this.savedBmr = user.bmr;
				}
				this.loading = false;
			},
			error: () => { this.loading = false; },
		});
	}

	recalcBmr(): void {
		const { gender, age, weight, height, activityLevel } = this.bmrForm.value;
		if (!age || !weight || !height) {
			this.calculatedBmr = null;
			return;
		}
		const base = gender === 'male'
			? 10 * weight + 6.25 * height - 5 * age + 5
			: 10 * weight + 6.25 * height - 5 * age - 161;
		this.calculatedBmr = Math.round(base * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2));
	}

	useBmrAsGoal(): void {
		const value = this.calculatedBmr || this.savedBmr;
		if (value) this.form.get('calories')?.setValue(value);
	}

	onSubmit(): void {
		if (!this.form.valid) return;
		const id = localStorage.getItem('id') ?? '';
		this.saving = true;
		this.saved = false;
		this.userService.updateMacroGoals(id, this.form.value as MacroGoals).subscribe({
			next: () => {
				this.saving = false;
				this.saved = true;
				setTimeout(() => this.saved = false, 2500);
			},
			error: () => { this.saving = false; },
		});
	}

	saveBmr(): void {
		if (!this.calculatedBmr) return;
		const id = localStorage.getItem('id') ?? '';
		this.bmrSaving = true;
		this.bmrSaved = false;
		this.userService.updateBmr(id, this.calculatedBmr).subscribe({
			next: () => {
				this.savedBmr = this.calculatedBmr;
				this.bmrSaving = false;
				this.bmrSaved = true;
				setTimeout(() => this.bmrSaved = false, 2500);
			},
			error: () => { this.bmrSaving = false; },
		});
	}
}
