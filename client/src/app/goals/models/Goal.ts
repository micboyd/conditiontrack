import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Milestone {
	_id?: string;
	title: string;
	targetDate: string | null;
	completed: boolean;
	completedAt: string | null;
}

export type GoalMode = 'simple' | 'advanced';
export type GoalCategory = 'strength' | 'cardio' | 'nutrition' | 'body-composition';
export type GoalTracking = 'manual' | 'auto';
export type GoalMetric =
	| 'workout_count'
	| 'cardio_sessions'
	| 'cardio_minutes'
	| 'nutrition_days'
	| 'exercise_weight'
	| 'body_weight';
export type GoalPeriod = 'week' | 'month' | 'total';
export type GoalDirection = 'increase' | 'decrease';
export type GoalStatus = 'active' | 'completed';

export class Goal {
	_id: string;
	userId: string;
	mode: GoalMode;
	title: string;
	description: string;
	category: GoalCategory | null;
	trackingType: GoalTracking;
	metric: GoalMetric | null;
	period: GoalPeriod | null;
	exerciseName: string | null;
	direction: GoalDirection;
	targetValue: number;
	startValue: number;
	currentValue: number;
	unit: string;
	targetDate: string | null;
	notes: string;
	status: GoalStatus;
	milestones: Milestone[];
	createdAt?: string;

	constructor(data?: Partial<Goal>) {
		this._id          = data?._id || '';
		this.userId       = data?.userId || localStorage.getItem('id') || '';
		this.mode         = data?.mode ?? 'simple';
		this.title        = data?.title || '';
		this.description  = data?.description || '';
		this.category     = data?.category ?? null;
		this.trackingType = data?.trackingType || 'manual';
		this.metric       = data?.metric ?? null;
		this.period       = data?.period ?? null;
		this.exerciseName = data?.exerciseName ?? null;
		this.direction    = data?.direction ?? 'increase';
		this.targetValue  = data?.targetValue ?? 0;
		this.startValue   = data?.startValue ?? 0;
		this.currentValue = data?.currentValue ?? 0;
		this.unit         = data?.unit || '';
		this.targetDate   = data?.targetDate ?? null;
		this.notes        = data?.notes || '';
		this.status       = data?.status || 'active';
		this.milestones   = data?.milestones ?? [];
		this.createdAt    = data?.createdAt;
	}

	static toFormGroup(goal: Goal, fb: FormBuilder): FormGroup {
		return fb.group({
			_id:          [goal._id],
			userId:       [goal.userId],
			mode:         [goal.mode],
			title:        [goal.title, [Validators.required, Validators.maxLength(120)]],
			description:  [goal.description],
			category:     [goal.category],
			trackingType: [goal.trackingType],
			metric:       [goal.metric],
			period:       [goal.period],
			exerciseName: [goal.exerciseName],
			direction:    [goal.direction],
			targetValue:  [goal.targetValue],
			startValue:   [goal.startValue],
			currentValue: [goal.currentValue],
			unit:         [goal.unit],
			targetDate:   [goal.targetDate],
			notes:        [goal.notes],
			status:       [goal.status],
		});
	}
}
