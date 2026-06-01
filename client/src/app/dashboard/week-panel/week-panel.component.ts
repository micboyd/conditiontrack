import { Component, Input, OnChanges } from '@angular/core';
import { addDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from 'date-fns';

import { ConditioningRecord } from '../../conditioning/models/ConditioningRecord';
import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { DailyLog } from '../../nutrition/models/DailyLog';
import { DayPlan, WeekPlan } from '../../week-planner/models/WeekPlan';
import { Meal } from '../../nutrition/models/Meal';
import { UserProfile } from '../../shared/services/user.service';
import { Workout } from '../../strength/models/Workout';
import { WorkoutRecord } from '../../strength/models/WorkoutRecord';

@Component({
	selector: 'app-week-panel',
	templateUrl: './week-panel.component.html',
	standalone: false,
})
export class WeekPanelComponent implements OnChanges {
	@Input() user: UserProfile | null = null;
	@Input() nutritionEnabled = true;
	@Input() workouts: Workout[] = [];
	@Input() conditioningSessions: ConditioningSession[] = [];
	@Input() workoutRecords: WorkoutRecord[] = [];
	@Input() conditioningRecords: ConditioningRecord[] = [];
	@Input() weeklyDailyLogs: DailyLog[] = [];
	@Input() allMeals: Meal[] = [];
	@Input() weekPlan: WeekPlan | null = null;

	readonly todayStr = format(new Date(), 'yyyy-MM-dd');

	weeklyCaloriesView: 'summary' | 'breakdown' = 'summary';

	dailyBreakdowns: Record<string, { calsIn: number; calsOut: number; diff: number; bmr: number; activityCals: number }> = {};

	ngOnChanges(): void {
		this.computeDailyBreakdowns();
	}

	private toDateStr(date: string | Date): string {
		if (typeof date === 'string') {
			return date.length === 10 ? date : format(new Date(date), 'yyyy-MM-dd');
		}
		return format(date, 'yyyy-MM-dd');
	}

	private isThisWeek(dateStr: string): boolean {
		try {
			const date = parseISO(dateStr);
			const now = new Date();
			return isWithinInterval(date, {
				start: startOfWeek(now, { weekStartsOn: 1 }),
				end: endOfWeek(now, { weekStartsOn: 1 }),
			});
		} catch {
			return false;
		}
	}

	// ── Weekly stats ────────────────────────────────────────────────────────

	get workoutsThisWeek(): number {
		return this.workoutRecords.filter((r) => this.isThisWeek(r.date)).length;
	}

	get cardioThisWeek(): number {
		return this.conditioningRecords.filter((r) => this.isThisWeek(r.date)).length;
	}

	get caloriesThisWeek(): number {
		return this.conditioningRecords
			.filter((r) => this.isThisWeek(r.date))
			.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0);
	}

	get totalTrainingTimeThisWeek(): number {
		const strengthMins = this.workoutRecords
			.filter((r) => this.isThisWeek(r.date))
			.reduce((sum, r) => sum + (r.duration ?? 0), 0);
		const cardioMins = this.conditioningRecords
			.filter((r) => this.isThisWeek(r.date))
			.reduce((sum, r) => sum + (r.duration ?? 0), 0);
		return strengthMins + cardioMins;
	}

	get activeDaysThisWeek(): number {
		const days = new Set<string>();
		this.workoutRecords
			.filter((r) => this.isThisWeek(r.date))
			.forEach((r) => days.add(this.toDateStr(r.date)));
		this.conditioningRecords
			.filter((r) => this.isThisWeek(r.date))
			.forEach((r) => days.add(this.toDateStr(r.date)));
		return days.size;
	}

	get totalSetsThisWeek(): number {
		return this.workoutRecords
			.filter((r) => this.isThisWeek(r.date))
			.reduce((sum, r) => sum + r.exercises.reduce((s, e) => s + (e.sets?.length ?? 0), 0), 0);
	}

	get weeklyCaloriesEaten(): number {
		return this.weeklyDailyLogs.reduce((total, log) => {
			const mealCals = log.meals
				.map(id => this.allMeals.find(m => m._id === id))
				.filter((m): m is Meal => !!m)
				.reduce((sum, m) => sum + m.calories, 0);
			return total + mealCals;
		}, 0);
	}

	private get pastDailyLogs(): DailyLog[] {
		return this.weeklyDailyLogs.filter(log =>
			log.date < this.todayStr && (log.meals.length > 0 || (log.extraCaloriesBurned ?? 0) > 0)
		);
	}

	get daysLoggedThisWeek(): number {
		return this.pastDailyLogs.length;
	}

	get dailyAverageCaloriesEaten(): number {
		const days = this.daysLoggedThisWeek;
		if (days === 0) return 0;
		const total = this.pastDailyLogs.reduce((sum, log) => {
			return sum + log.meals
				.map(id => this.allMeals.find(m => m._id === id))
				.filter((m): m is Meal => !!m)
				.reduce((s, m) => s + m.calories, 0);
		}, 0);
		return Math.round(total / days);
	}

	get dailyAverageCaloriesBurned(): number {
		const pastDates = new Set(this.pastDailyLogs.map(l => l.date));
		const activePastDays = new Set<string>();
		this.conditioningRecords
			.filter(r => this.toDateStr(r.date) < this.todayStr && this.isThisWeek(r.date))
			.forEach(r => activePastDays.add(this.toDateStr(r.date)));
		this.pastDailyLogs.filter(l => (l.extraCaloriesBurned ?? 0) > 0).forEach(l => activePastDays.add(l.date));
		const burnDays = activePastDays.size || pastDates.size;
		if (burnDays === 0) return 0;
		const totalBurned = this.conditioningRecords
			.filter(r => this.toDateStr(r.date) < this.todayStr && this.isThisWeek(r.date))
			.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0)
			+ this.pastDailyLogs.reduce((sum, l) => sum + (l.extraCaloriesBurned ?? 0), 0);
		return Math.round(totalBurned / burnDays);
	}

	get weeklyExtraCaloriesBurned(): number {
		return this.weeklyDailyLogs.reduce((sum, log) => sum + (log.extraCaloriesBurned ?? 0), 0);
	}

	/** Number of week days that have fully completed (strictly before today) */
	get completedPastDaysThisWeek(): number {
		const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		let count = 0;
		for (let i = 0; i < 7; i++) {
			const dateStr = format(addDays(weekStart, i), 'yyyy-MM-dd');
			if (dateStr < this.todayStr) count++;
		}
		return count;
	}

	get weeklyTotalCaloriesBurned(): number {
		const bmrDaily = this.user?.bmr ?? 0;
		const bmrThisWeek = bmrDaily * this.completedPastDaysThisWeek;
		const now = new Date();
		const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
		const todayPartialBmr = Math.round((bmrDaily / 1440) * minutesSinceMidnight);
		return this.caloriesThisWeek + this.weeklyExtraCaloriesBurned + bmrThisWeek + todayPartialBmr;
	}

	/** Weekly calorie intake target (macroGoal or BMR × 7). */
	get weeklyCalorieTarget(): number {
		return (this.user?.macroGoals?.calories ?? this.user?.bmr ?? 0) * 7;
	}

	/** Weekly maintenance baseline (BMR × 7). */
	get weeklyMaintenance(): number {
		return (this.user?.bmr ?? 0) * 7;
	}

	get weeklyCalorieBalance(): number {
		return this.weeklyCaloriesEaten - this.weeklyTotalCaloriesBurned;
	}

	get weeklyCaloriesInPct(): number {
		if (!this.weeklyCalorieTarget) return 0;
		return Math.min(100, (this.weeklyCaloriesEaten / this.weeklyCalorieTarget) * 100);
	}

	// ── Weekly on-track prediction ───────────────────────────────────────────

	/** Number of completed days (with at least one meal or burn logged) */
	get completedDaysThisWeek(): number {
		const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		let count = 0;
		for (let i = 0; i < 7; i++) {
			const date = addDays(weekStart, i);
			const dateStr = format(date, 'yyyy-MM-dd');
			if (dateStr > this.todayStr) break;
			const hasMeals = this.weeklyDailyLogs.some(log => log.date === dateStr && log.meals.length > 0);
			const hasWorkout = this.workoutRecords.some(r => this.toDateStr(r.date) === dateStr);
			const hasCardio = this.conditioningRecords.some(r => this.toDateStr(r.date) === dateStr);
			if (hasMeals || hasWorkout || hasCardio) count++;
		}
		return count;
	}

	/** Days remaining in the current week */
	get daysRemainingThisWeek(): number {
		const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
		const remaining = Math.max(0, Math.ceil((weekEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
		return remaining;
	}

	/** Projected weekly calorie balance if current pace continues */
	get projectedWeeklyDeficit(): number {
		const currentDeficit = this.weeklyCalorieBalance;
		const daysRemaining = this.daysRemainingThisWeek;
		const avgDailyDeficit = this.averageDailyDeficit ?? 0;
		return currentDeficit + (avgDailyDeficit * daysRemaining);
	}

	/** Status object for weekly on-track indicator */
	get weeklyOnTrackStatus(): { status: 'on-track' | 'ahead' | 'behind'; message: string } {
		const dailyDeficitTarget = this.user?.dailyDeficitTarget ?? 0;
		const targetDeficit = -(dailyDeficitTarget * 7);
		const projected = this.projectedWeeklyDeficit;
		const daysCompleted = this.completedDaysThisWeek;

		// Only show status if daily deficit target is set
		if (!dailyDeficitTarget) {
			return { status: 'on-track', message: 'Set daily deficit in settings' };
		}

		// Only show status if at least 2 days of data
		if (daysCompleted < 2) {
			return { status: 'on-track', message: 'Log more data to see forecast' };
		}

		const diff = projected - targetDeficit;
		const lbs = Math.abs(projected) / 3500;
		if (Math.abs(diff) <= 250) {
			return { status: 'on-track', message: `On track for ~${lbs.toFixed(1)}lb loss` };
		} else if (diff > 0) {
			return { status: 'behind', message: `Might miss goal by ~${(Math.abs(diff) / 3500).toFixed(1)}lb` };
		} else {
			return { status: 'ahead', message: `Ahead of goal by ~${(Math.abs(diff) / 3500).toFixed(1)}lb` };
		}
	}

	// ── Daily breakdown ─────────────────────────────────────────────────────

	getDailyBreakdown(dateStr: string): { calsIn: number; calsOut: number; diff: number; bmr: number; activityCals: number } {
		const log = this.weeklyDailyLogs.find(l => l.date === dateStr);
		const calsIn = log
			? log.meals
				.map(id => this.allMeals.find(m => m._id === id))
				.filter((m): m is Meal => !!m)
				.reduce((sum, m) => sum + m.calories, 0)
			: 0;
		const bmrDaily = this.user?.bmr ?? 0;
		let bmr: number;
		if (dateStr < this.todayStr) {
			bmr = bmrDaily;
		} else if (dateStr === this.todayStr) {
			const now = new Date();
			const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
			bmr = Math.round((bmrDaily / 1440) * minutesSinceMidnight);
		} else {
			bmr = 0;
		}
		const cardioCals = this.conditioningRecords
			.filter(r => this.toDateStr(r.date) === dateStr)
			.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0);
		const extraCals = log?.extraCaloriesBurned ?? 0;
		const activityCals = cardioCals + extraCals;
		const calsOut = bmr + activityCals;
		return { calsIn, calsOut, diff: calsIn - calsOut, bmr, activityCals };
	}

	private computeDailyBreakdowns(): void {
		const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		for (let i = 0; i < 7; i++) {
			const dateStr = format(addDays(weekStart, i), 'yyyy-MM-dd');
			this.dailyBreakdowns[dateStr] = this.getDailyBreakdown(dateStr);
		}
	}

	/** Average daily deficit (negative = deficit) across completed past days with data. */
	get averageDailyDeficit(): number | null {
		const pastDays = this.currentWeekDays
			.filter(d => d.dateStr < this.todayStr)
			.map(d => this.dailyBreakdowns[d.dateStr])
			.filter((b): b is NonNullable<typeof b> => !!b && (b.calsIn > 0 || b.activityCals > 0));
		if (pastDays.length === 0) return null;
		const total = pastDays.reduce((sum, b) => sum + b.diff, 0);
		return Math.round(total / pastDays.length);
	}

	get averageDailyDeficitDayCount(): number {
		return this.currentWeekDays
			.filter(d => d.dateStr < this.todayStr)
			.filter(d => {
				const b = this.dailyBreakdowns[d.dateStr];
				return b && (b.calsIn > 0 || b.activityCals > 0);
			}).length;
	}

	// ── Current week (Mon–Sun) ───────────────────────────────────────────────

	get currentWeekDays(): {
		label: string; dayNum: string; month: string; dayName: string;
		dateStr: string; isToday: boolean; isPast: boolean;
		workouts: WorkoutRecord[]; cardio: ConditioningRecord[];
		planned: DayPlan | undefined;
	}[] {
		const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		return Array.from({ length: 7 }, (_, i) => {
			const date = addDays(weekStart, i);
			const dateStr = format(date, 'yyyy-MM-dd');
			return {
				label: format(date, 'EEE'),
				dayNum: format(date, 'd'),
				month: format(date, 'MMM'),
				dayName: format(date, 'EEEE'),
				dateStr,
				isToday: dateStr === this.todayStr,
				isPast: date < new Date(this.todayStr),
				workouts: this.workoutRecords.filter(r => this.toDateStr(r.date) === dateStr),
				cardio: this.conditioningRecords.filter(r => this.toDateStr(r.date) === dateStr),
				planned: this.weekPlan?.getDayPlan(format(date, 'EEEE')),
			};
		});
	}

	// ── Week plan helpers ────────────────────────────────────────────────────

	allPlannedWorkouts(planned: DayPlan | undefined): Workout[] {
		return this.weekPlan?.getAllWorkouts(planned?.dayName ?? '') ?? [];
	}

	allPlannedConditioning(planned: DayPlan | undefined): ConditioningSession[] {
		return this.weekPlan?.getAllConditioning(planned?.dayName ?? '') ?? [];
	}

	// ── Helpers ──────────────────────────────────────────────────────────────

	getWorkoutName(workoutId: string): string {
		return this.workouts.find((w) => w._id === workoutId)?.name ?? 'Strength Session';
	}

	getCardioName(sessionId: string): string {
		return this.conditioningSessions.find((s) => s._id === sessionId)?.name ?? 'Cardio Session';
	}
}
