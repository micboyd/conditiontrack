import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MacroGoals, UserService } from '../shared/services/user.service';
import { SelectOption } from '../shared/components/select/select.component';

const GENDER_OPTIONS: SelectOption[] = [
	{ value: 'male',   label: 'Male' },
	{ value: 'female', label: 'Female' },
];

@Component({
	selector: 'app-global-settings',
	templateUrl: './global-settings.component.html',
	standalone: false,
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
	readonly genderOptions = GENDER_OPTIONS;
	form!: FormGroup;
	loading = false;
	saving = false;
	saved = false;

	bmrForm!: FormGroup;
	calculatedBmr: number | null = null;
	savedBmr: number | null = null;
	bmrSaving = false;
	bmrSaved = false;
	bmrMode: 'calculator' | 'manual' = 'calculator';

	dailyDeficitForm!: FormGroup;
	savedDailyDeficit: number | null = null;
	dailyDeficitSaving = false;
	dailyDeficitSaved = false;

	nutritionEnabled = true;
	nutritionToggleSaving = false;
	nutritionToggleSaved = false;

	private valueChangesSub!: Subscription;
	private savedTimer?: ReturnType<typeof setTimeout>;
	private bmrSavedTimer?: ReturnType<typeof setTimeout>;
	private dailyDeficitSavedTimer?: ReturnType<typeof setTimeout>;
	private nutritionSavedTimer?: ReturnType<typeof setTimeout>;

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
			gender: ['male'],
			age:    [null, [Validators.min(1), Validators.max(120)]],
			weight: [null, [Validators.min(1)]],
			height: [null, [Validators.min(1)]],
			manualBmr: [null, [Validators.min(1)]],
		});

		this.dailyDeficitForm = this.fb.group({
			dailyDeficitTarget: [0, [Validators.min(0)]],
		});

		this.valueChangesSub = this.bmrForm.valueChanges.subscribe(() => this.recalcBmr());

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
				if (user.dailyDeficitTarget) {
					this.savedDailyDeficit = user.dailyDeficitTarget;
					this.dailyDeficitForm.get('dailyDeficitTarget')?.setValue(user.dailyDeficitTarget);
				}
				this.nutritionEnabled = user.nutritionEnabled !== false;
				this.loading = false;
			},
			error: () => { this.loading = false; },
		});
	}

	recalcBmr(): void {
		const { gender, age, weight, height } = this.bmrForm.value;
		if (!age || !weight || !height) {
			this.calculatedBmr = null;
			return;
		}
		this.calculatedBmr = Math.round(
			gender === 'male'
				? 10 * weight + 6.25 * height - 5 * age + 5
				: 10 * weight + 6.25 * height - 5 * age - 161
		);
	}

	useBmrAsGoal(): void {
		const value = this.calculatedBmr || this.savedBmr;
		if (value) this.form.get('calories')?.setValue(value);
	}

	onBmrModeChange(selected: string[]): void {
		this.bmrMode = selected[0] === 'Calculator' ? 'calculator' : 'manual';
	}

	toggleNutrition(): void {
		const next = !this.nutritionEnabled;
		this.nutritionEnabled = next;
		this.nutritionToggleSaving = true;
		this.nutritionToggleSaved = false;
		const id = localStorage.getItem('id') ?? '';
		this.userService.updateNutritionEnabled(id, next).subscribe({
			next: () => {
				this.nutritionToggleSaving = false;
				this.nutritionToggleSaved = true;
				clearTimeout(this.nutritionSavedTimer);
				this.nutritionSavedTimer = setTimeout(() => this.nutritionToggleSaved = false, 2500);
			},
			error: () => {
				// revert on failure
				this.nutritionEnabled = !next;
				this.nutritionToggleSaving = false;
			},
		});
	}

	ngOnDestroy(): void {
		this.valueChangesSub?.unsubscribe();
		clearTimeout(this.savedTimer);
		clearTimeout(this.bmrSavedTimer);
		clearTimeout(this.dailyDeficitSavedTimer);
		clearTimeout(this.nutritionSavedTimer);
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
				clearTimeout(this.savedTimer);
				this.savedTimer = setTimeout(() => this.saved = false, 2500);
			},
			error: () => { this.saving = false; },
		});
	}

	saveBmr(): void {
		const value = this.bmrMode === 'calculator' ? this.calculatedBmr : this.bmrForm.get('manualBmr')?.value;
		if (!value) return;
		const id = localStorage.getItem('id') ?? '';
		this.bmrSaving = true;
		this.bmrSaved = false;
		this.userService.updateBmr(id, value).subscribe({
			next: () => {
				this.savedBmr = value;
				this.bmrSaving = false;
				this.bmrSaved = true;
				clearTimeout(this.bmrSavedTimer);
				this.bmrSavedTimer = setTimeout(() => this.bmrSaved = false, 2500);
			},
			error: () => { this.bmrSaving = false; },
		});
	}

	saveDailyDeficitTarget(): void {
		const value = this.dailyDeficitForm.get('dailyDeficitTarget')?.value;
		if (value === null || value === undefined) return;
		const id = localStorage.getItem('id') ?? '';
		this.dailyDeficitSaving = true;
		this.dailyDeficitSaved = false;
		this.userService.updateDailyDeficitTarget(id, value).subscribe({
			next: () => {
				this.savedDailyDeficit = value;
				this.dailyDeficitSaving = false;
				this.dailyDeficitSaved = true;
				clearTimeout(this.dailyDeficitSavedTimer);
				this.dailyDeficitSavedTimer = setTimeout(() => this.dailyDeficitSaved = false, 2500);
			},
			error: () => { this.dailyDeficitSaving = false; },
		});
	}
}
