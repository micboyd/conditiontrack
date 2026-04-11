import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Goal, GoalCategory, GoalMetric } from '../models/Goal';
import { GoalsService } from '../goals.service';

interface MetricOption {
	label: string;
	value: GoalMetric;
	needsPeriod: boolean;
	needsExercise: boolean;
}

const METRIC_MAP: Record<GoalCategory, MetricOption[]> = {
	'strength': [
		{ label: 'Log X workouts per period',  value: 'workout_count',   needsPeriod: true,  needsExercise: false },
		{ label: 'Reach X kg on an exercise',  value: 'exercise_weight', needsPeriod: false, needsExercise: true  },
	],
	'cardio': [
		{ label: 'Log X sessions per period',  value: 'cardio_sessions', needsPeriod: true,  needsExercise: false },
		{ label: 'Accumulate X minutes',       value: 'cardio_minutes',  needsPeriod: true,  needsExercise: false },
	],
	'nutrition': [
		{ label: 'Log X days per period',      value: 'nutrition_days',  needsPeriod: true,  needsExercise: false },
	],
	'body-composition': [
		{ label: 'Reach target body weight',   value: 'body_weight',     needsPeriod: false, needsExercise: false },
	],
};

const DEFAULT_UNIT: Record<GoalMetric, string> = {
	workout_count:   'workouts',
	cardio_sessions: 'sessions',
	cardio_minutes:  'min',
	nutrition_days:  'days',
	exercise_weight: 'kg',
	body_weight:     'kg',
};

@Component({
	selector: 'app-edit-goal',
	standalone: false,
	templateUrl: './edit-goal.component.html',
})
export class EditGoalComponent implements OnInit, OnChanges {
	@Input() selectedGoal: Goal | null = null;
	@Output() closeEvent = new EventEmitter<void>();

	goalForm!: FormGroup;
	formLoading = false;

	readonly categories = ['strength', 'cardio', 'nutrition', 'body-composition'];
	readonly periods = ['week', 'month', 'total'];

	constructor(private fb: FormBuilder, private goalsService: GoalsService) {}

	ngOnInit(): void {
		this.buildForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedGoal'] && this.goalForm) {
			this.buildForm();
		}
	}

	private buildForm(): void {
		const goal = this.selectedGoal ?? new Goal();
		this.goalForm = Goal.toFormGroup(goal, this.fb);
	}

	// ── Derived state ─────────────────────────────────────────────────────────

	get selectedCategory(): GoalCategory {
		return this.goalForm.get('category')?.value as GoalCategory;
	}

	get selectedTracking(): string {
		return this.goalForm.get('trackingType')?.value;
	}

	get selectedMetric(): GoalMetric | null {
		return this.goalForm.get('metric')?.value;
	}

	get availableMetrics(): MetricOption[] {
		return METRIC_MAP[this.selectedCategory] ?? [];
	}

	get needsPeriod(): boolean {
		if (this.selectedTracking !== 'auto') return false;
		return this.availableMetrics.find(m => m.value === this.selectedMetric)?.needsPeriod ?? false;
	}

	get needsExerciseName(): boolean {
		if (this.selectedTracking !== 'auto') return false;
		return this.availableMetrics.find(m => m.value === this.selectedMetric)?.needsExercise ?? false;
	}

	// ── Event handlers ────────────────────────────────────────────────────────

	onCategoryChange(values: string[]): void {
		const cat = values[0] as GoalCategory;
		this.goalForm.get('category')?.setValue(cat);
		this.goalForm.get('metric')?.setValue(null);
		this.goalForm.get('period')?.setValue(null);
		this.goalForm.get('exerciseName')?.setValue(null);
		this.goalForm.get('unit')?.setValue('');
	}

	onTrackingTypeChange(values: string[]): void {
		const type = values[0];
		this.goalForm.get('trackingType')?.setValue(type);
		if (type === 'manual') {
			this.goalForm.get('metric')?.setValue(null);
			this.goalForm.get('period')?.setValue(null);
			this.goalForm.get('exerciseName')?.setValue(null);
		}
	}

	onMetricChange(metric: GoalMetric): void {
		this.goalForm.get('metric')?.setValue(metric);
		this.goalForm.get('unit')?.setValue(DEFAULT_UNIT[metric] ?? '');
		const def = this.availableMetrics.find(m => m.value === metric);
		if (!def?.needsPeriod) this.goalForm.get('period')?.setValue(null);
		if (!def?.needsExercise) this.goalForm.get('exerciseName')?.setValue(null);
	}

	onPeriodChange(values: string[]): void {
		this.goalForm.get('period')?.setValue(values[0] || null);
	}

	onDirectionChange(values: string[]): void {
		this.goalForm.get('direction')?.setValue(values[0] || 'increase');
	}

	isInvalid(field: string): boolean {
		const c = this.goalForm.get(field);
		return !!(c && c.touched && c.invalid);
	}

	onSubmit(): void {
		this.goalForm.markAllAsTouched();
		if (this.goalForm.invalid) return;

		this.formLoading = true;
		const value = this.goalForm.value;

		if (this.selectedGoal?._id) {
			this.goalsService.updateGoal(this.selectedGoal._id, value).subscribe(() => {
				this.formLoading = false;
				this.closeEvent.emit();
			});
		} else {
			// Capture starting point for progress calculation on decrease goals
			value.startValue = value.currentValue;
			this.goalsService.createGoal(value).subscribe(() => {
				this.formLoading = false;
				this.closeEvent.emit();
			});
		}
	}

	onCancel(): void {
		this.closeEvent.emit();
	}
}
