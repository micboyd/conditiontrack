import { ConditioningSession } from "../../conditioning/models/ConditioningSession";
import { Workout } from "../../strength/models/Workout";

export interface DayPlan {
	dayName: string;
	workouts: Workout[];
	conditioning: ConditioningSession[];
}

export class WeekPlan {
	days: DayPlan[];

	constructor() {
		const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		this.days = weekDays.map(day => ({
			dayName: day,
			workouts: [] as Workout[],
			conditioning: [] as ConditioningSession[],
		} as DayPlan));
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

	getDayPlan(day: string): DayPlan | undefined {
		return this.days.find(d => d.dayName === day);
	}
}
