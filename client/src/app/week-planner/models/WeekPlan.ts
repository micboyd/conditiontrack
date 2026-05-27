import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { Workout } from '../../strength/models/Workout';

export type TimeBlockKey = 'morning' | 'afternoon' | 'evening';

export interface TimeBlock {
	workouts: Workout[];
	conditioning: ConditioningSession[];
}

export interface DayPlan {
	_id: string;
	dayName: string;
	note: string;
	// Overarching (all-day)
	workouts: Workout[];
	conditioning: ConditioningSession[];
	// Time blocks
	morning: TimeBlock;
	afternoon: TimeBlock;
	evening: TimeBlock;
}

export interface DayPlanDTO {
	dayName: string;
	note: string;
	workouts: string[];
	conditioning: string[];
	morning: { workouts: string[]; conditioning: string[] };
	afternoon: { workouts: string[]; conditioning: string[] };
	evening: { workouts: string[]; conditioning: string[] };
}

export interface WeekPlanDTO {
	userId: string;
	weekStart: string;
	days: DayPlanDTO[];
}

const emptyBlock = (): TimeBlock => ({ workouts: [], conditioning: [] });

export class WeekPlan {
	userId: string;
	_id: string;
	weekStart: string;
	appliedTemplate?: { id: string; name: string };
	days: DayPlan[];

	constructor(weekPlan?: Partial<WeekPlan>) {
		this._id = weekPlan?._id ?? '';
		this.userId = weekPlan?.userId ?? localStorage.getItem('id') ?? '';
		this.weekStart = weekPlan?.weekStart ?? '';
		this.appliedTemplate = weekPlan?.appliedTemplate;

		const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

		this.days = weekDays.map(day => {
			const existingDay = weekPlan?.days?.find(d => d.dayName === day);
			return {
				_id:          existingDay?._id || '',
				dayName:      day,
				note:         existingDay?.note ?? '',
				workouts:     existingDay?.workouts    ?? [],
				conditioning: existingDay?.conditioning ?? [],
				morning:      existingDay?.morning   ?? emptyBlock(),
				afternoon:    existingDay?.afternoon ?? emptyBlock(),
				evening:      existingDay?.evening   ?? emptyBlock(),
			} as DayPlan;
		});
	}

	// ── Overarching helpers ───────────────────────────────────────────────────

	addWorkout(day: string, workout: Workout) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d.workouts.push(workout);
	}

	addConditioning(day: string, session: ConditioningSession) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d.conditioning.push(session);
	}

	removeWorkout(day: string, workout: Workout) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d.workouts = d.workouts.filter(w => w._id !== workout._id);
	}

	removeConditioning(day: string, session: ConditioningSession) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d.conditioning = d.conditioning.filter(c => c._id !== session._id);
	}

	// ── Time-block helpers ────────────────────────────────────────────────────

	addWorkoutToBlock(day: string, block: TimeBlockKey, workout: Workout) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d[block].workouts.push(workout);
	}

	addConditioningToBlock(day: string, block: TimeBlockKey, session: ConditioningSession) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d[block].conditioning.push(session);
	}

	removeWorkoutFromBlock(day: string, block: TimeBlockKey, workout: Workout) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d[block].workouts = d[block].workouts.filter(w => w._id !== workout._id);
	}

	removeConditioningFromBlock(day: string, block: TimeBlockKey, session: ConditioningSession) {
		const d = this.days.find(p => p.dayName === day);
		if (d) d[block].conditioning = d[block].conditioning.filter(c => c._id !== session._id);
	}

	// ── Convenience ───────────────────────────────────────────────────────────

	getDayPlan(day: string): DayPlan | undefined {
		return this.days.find(d => d.dayName === day);
	}

	/** Returns all planned workouts for a day (overarching + all blocks) */
	getAllWorkouts(day: string): Workout[] {
		const d = this.getDayPlan(day);
		if (!d) return [];
		return [...d.workouts, ...d.morning.workouts, ...d.afternoon.workouts, ...d.evening.workouts];
	}

	/** Returns all planned conditioning for a day (overarching + all blocks) */
	getAllConditioning(day: string): ConditioningSession[] {
		const d = this.getDayPlan(day);
		if (!d) return [];
		return [...d.conditioning, ...d.morning.conditioning, ...d.afternoon.conditioning, ...d.evening.conditioning];
	}

	payload(): WeekPlanDTO {
		return {
			userId: this.userId,
			weekStart: this.weekStart,
			days: this.days.map(d => ({
				...(d._id && { _id: d._id }),
				dayName:      d.dayName,
				note:         d.note ?? '',
				workouts:     d.workouts.map(w => w._id),
				conditioning: d.conditioning.map(c => c._id),
				morning:   { workouts: d.morning.workouts.map(w => w._id),   conditioning: d.morning.conditioning.map(c => c._id) },
				afternoon: { workouts: d.afternoon.workouts.map(w => w._id), conditioning: d.afternoon.conditioning.map(c => c._id) },
				evening:   { workouts: d.evening.workouts.map(w => w._id),   conditioning: d.evening.conditioning.map(c => c._id) },
			})),
		};
	}
}
