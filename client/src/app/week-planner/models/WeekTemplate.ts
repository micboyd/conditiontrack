import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { Workout } from '../../strength/models/Workout';
import { DayPlan, DayPlanDTO, TimeBlock, TimeBlockKey } from './WeekPlan';

export interface WeekTemplateDTO {
	userId: string;
	name: string;
	description: string;
	days: DayPlanDTO[];
}

const emptyBlock = (): TimeBlock => ({ workouts: [], conditioning: [] });

export class WeekTemplate {
	_id: string;
	userId: string;
	name: string;
	description: string;
	days: DayPlan[];

	constructor(template?: Partial<WeekTemplate>) {
		this._id = template?._id ?? '';
		this.userId = template?.userId ?? localStorage.getItem('id') ?? '';
		this.name = template?.name ?? '';
		this.description = template?.description ?? '';

		const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

		this.days = weekDays.map(day => {
			const existingDay = template?.days?.find(d => d.dayName === day);
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

	getDayPlan(day: string): DayPlan | undefined {
		return this.days.find(d => d.dayName === day);
	}

	hasAnyContent(): boolean {
		return this.days.some(d =>
			d.workouts.length > 0 || d.conditioning.length > 0 ||
			d.morning.workouts.length > 0 || d.morning.conditioning.length > 0 ||
			d.afternoon.workouts.length > 0 || d.afternoon.conditioning.length > 0 ||
			d.evening.workouts.length > 0 || d.evening.conditioning.length > 0,
		);
	}

	payload(): WeekTemplateDTO {
		return {
			userId:      this.userId,
			name:        this.name,
			description: this.description,
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
