import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { Workout } from '../../strength/models/Workout';

export interface DayPlan {
	dayName: string;
	workouts: Workout[];
	conditioning: ConditioningSession[];
}

export interface DayPlanDTO {
	dayName: string;
	workouts: string[];
	conditioning: string[];
}

export interface WeekPlanDTO {
	userId: string;
	days: DayPlanDTO[];
}

export class WeekPlan {
	userId: string;
	_id: string;
	days: DayPlan[];

	constructor(weekPlan?: Partial<WeekPlan>) {
		this._id = weekPlan?._id ?? '';
		this.userId = weekPlan?.userId ?? localStorage.getItem('id') ?? '';

		const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		this.days = weekDays.map(day => {
			// Try to find an existing day in input, else init fresh
			const existingDay = weekPlan?.days?.find(d => d.dayName === day);
			return {
				dayName: day,
				workouts: existingDay?.workouts ?? [],
				conditioning: existingDay?.conditioning ?? [],
			} as DayPlan;
		});
	}

	addWorkout(day: string, workout: Workout) {
		const dayPlan = this.days.find(d => d.dayName === day);
		if (dayPlan) {
			dayPlan.workouts.push(workout);
		}
	}

	addConditioning(day: string, session: ConditioningSession) {
		const dayPlan = this.days.find(d => d.dayName === day);
		if (dayPlan) {
			dayPlan.conditioning.push(session);
		}
	}

	removeWorkout(day: string, workout: Workout) {
		const dayPlan = this.days.find(d => d.dayName === day);
		if (dayPlan) {
			dayPlan.workouts = dayPlan.workouts.filter(w => w._id !== workout._id);
		}
	}

	removeConditioning(day: string, session: ConditioningSession) {
		const dayPlan = this.days.find(d => d.dayName === day);
		if (dayPlan) {
			dayPlan.conditioning = dayPlan.conditioning.filter(c => c._id !== session._id);
		}
	}

	getDayPlan(day: string): DayPlan | undefined {
		return this.days.find(d => d.dayName === day);
	}

	payload(): WeekPlanDTO {
		return {
			userId: this.userId,
			days: this.days.map(d => ({
				dayName: d.dayName,
				workouts: d.workouts.map(w => w._id),
				conditioning: d.conditioning.map(c => c._id),
			})),
		};
	}
}
