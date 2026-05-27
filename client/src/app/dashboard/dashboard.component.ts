import { Component, OnInit, ViewChild } from '@angular/core';
import { addDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek, subDays } from 'date-fns';

import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../conditioning/models/ConditioningRecord';
import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { DailyLog } from '../nutrition/models/DailyLog';
import { DailyLogService } from '../shared/services/daily-log.service';
import { DayPlan } from '../week-planner/models/WeekPlan';
import { Meal } from '../nutrition/models/Meal';
import { MealFilterValue } from '../shared/components/meal-filter/meal-filter.component';
import { MealLibraryService } from '../nutrition/meal-library/meal-library.service';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { UserProfile, UserService } from '../shared/services/user.service';
import { WeekPlan } from '../week-planner/models/WeekPlan';
import { WeekPlannerService } from '../week-planner/week-planner.service';
import { Workout } from '../strength/models/Workout';
import { WorkoutRecord } from '../strength/models/WorkoutRecord';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';
import { WorkoutService } from '../strength/workout-library/workout.service';
import { forkJoin, of } from 'rxjs';
import { Goal } from '../goals/models/Goal';
import { GoalsService } from '../goals/goals.service';
import { Measurement } from '../progress/models/Measurement';
import { MeasurementsService } from '../progress/measurements/measurements.service';

export interface ActivityEntry {
	date: string;
	type: 'Strength' | 'Cardio';
	name: string;
	duration: number;
}

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	standalone: false,
})
export class DashboardComponent implements OnInit {
	@ViewChild('mealPickerDrawer') mealPickerDrawer!: SideDrawerComponent;
	@ViewChild('logWorkoutDrawer') logWorkoutDrawer!: SideDrawerComponent;
	@ViewChild('logCardioDrawer') logCardioDrawer!: SideDrawerComponent;

	user: UserProfile | null = null;
	loading = true;
	readonly todayStr = format(new Date(), 'yyyy-MM-dd');

	// Dashboard tab
	activeTab: 'day' | 'week' = 'day';
	weeklyCaloriesView: 'summary' | 'breakdown' = 'summary';

	// Day navigation
	viewDate: Date = new Date();
	viewDateLog: DailyLog | null = null;

	// Extra (manual) burned calories
	extraCaloriesSaving = false;

	mealPickerFilter: MealFilterValue = { search: '', category: '', calorieMin: null, calorieMax: null };


	// Workout logging state
	lastWorkoutRecord: WorkoutRecord | null = null;

	// Cardio logging state
	logCardioDrawerOpen = false;
	logCardioInitialRecord: ConditioningRecord | null = null;
	logCardioSessionToView: ConditioningSession | null = null;

	private workoutRecords: WorkoutRecord[] = [];
	private conditioningRecords: ConditioningRecord[] = [];
	workouts: Workout[] = [];
	conditioningSessions: ConditioningSession[] = [];
	private weekPlan: WeekPlan | null = null;
	private allMeals: Meal[] = [];
	private weeklyDailyLogs: DailyLog[] = [];

	activeGoals: Goal[] = [];
	goalAutoValues = new Map<string, number>();
	private measurements: Measurement[] = [];

	dailyBreakdowns: Record<string, { calsIn: number; calsOut: number; diff: number; bmr: number; activityCals: number }> = {};


	constructor(
		private userService: UserService,
		private workoutRecordService: WorkoutRecordService,
		private workoutService: WorkoutService,
		private conditioningRecordService: ConditioningRecordService,
		private conditioningLibraryService: ConditioningLibraryService,
		private weekPlannerService: WeekPlannerService,
		private mealLibraryService: MealLibraryService,
		private dailyLogService: DailyLogService,
		private goalsService: GoalsService,
		private measurementsService: MeasurementsService,
	) {}

	ngOnInit(): void {
		const id = localStorage.getItem('id') ?? '';
		const now = new Date();
		const weekStart = startOfWeek(now, { weekStartsOn: 1 });
		const spansTwoMonths = weekStart.getMonth() !== now.getMonth();

		forkJoin({
			user: this.userService.getUser(id),
			workoutRecords: this.workoutRecordService.getAllWorkoutRecords(),
			conditioningRecords: this.conditioningRecordService.getAllConditioningRecords(),
			workouts: this.workoutService.getAllWorkouts(),
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			weekPlan: this.weekPlannerService.getWeekPlanByWeek(id, format(weekStart, 'yyyy-MM-dd')),
			mealLibrary: this.mealLibraryService.getAllMeals(),
			dailyLog: this.dailyLogService.getLog(id, this.todayStr),
			goals: this.goalsService.getAllGoals(),
			measurements: this.measurementsService.getAll(id),
			monthLogs: this.dailyLogService.getMonthlyLogs(id, now.getFullYear(), now.getMonth() + 1),
			prevMonthLogs: spansTwoMonths
				? this.dailyLogService.getMonthlyLogs(id, weekStart.getFullYear(), weekStart.getMonth() + 1)
				: of([] as DailyLog[]),
		}).subscribe({
			next: (data) => {
				this.user = data.user;
				this.workoutRecords = data.workoutRecords;
				this.conditioningRecords = data.conditioningRecords;
				this.workouts = data.workouts;
				this.conditioningSessions = data.conditioningSessions;
				this.weekPlan = new WeekPlan(data.weekPlan);
				this.allMeals = data.mealLibrary;
				this.viewDateLog = data.dailyLog;
				this.activeGoals = data.goals.map(g => new Goal(g));
				this.measurements = data.measurements;
				const weekDateStrs = new Set(this.currentWeekDays.map(d => d.dateStr));
				this.weeklyDailyLogs = [...data.monthLogs, ...data.prevMonthLogs]
					.filter(l => weekDateStrs.has(l.date));
				this.computeDailyBreakdowns();
				this.loading = false;
				this.goalsService.resolveAutoValues(this.activeGoals).subscribe(map => {
					this.goalAutoValues = map;
				});
			},
			error: () => {
				this.loading = false;
			},
		});
	}

	// ── Setup checklist ──────────────────────────────────────────────────────

	get checklistItems(): { title: string; completed: boolean; route: string }[] {
		return [
			{ title: 'Add a workout to your library',	completed: this.workouts.length > 0,			route: '/strength/workout-library' },
			{ title: 'Log your first strength session',	completed: this.workoutRecords.length > 0,		route: '/strength/workout-records' },
			{ title: 'Add a cardio session template',	completed: this.conditioningSessions.length > 0,route: '/conditioning/conditioning-library' },
			{ title: 'Log your first cardio session',	completed: this.conditioningRecords.length > 0,	route: '/conditioning/conditioning-records' },
			{ title: 'Add a meal to your library',		completed: this.allMeals.length > 0,			route: '/nutrition/meal-library' },
			{ title: 'Log a body measurement',			completed: this.measurements.length > 0,		route: '/progress/measurements' },
			{ title: 'Set a goal',						completed: this.activeGoals.length > 0,			route: '/goals' },
			{ title: 'Complete your profile',			completed: !!(this.user?.profileImage || this.user?.bio), route: '/profile' },
		];
	}

	get checklistDoneCount(): number { return this.checklistItems.filter(i => i.completed).length; }
	get checklistTotal(): number { return this.checklistItems.length; }
	get showChecklistBanner(): boolean { return !this.loading && this.checklistDoneCount < this.checklistTotal; }
	get checklistIncomplete(): { title: string; route: string }[] {
		return this.checklistItems.filter(i => !i.completed).slice(0, 3);
	}

	// ── Goals helpers ────────────────────────────────────────────────────────

	getGoalCurrent(goal: Goal): number {
		return goal.trackingType === 'auto'
			? (this.goalAutoValues.get(goal._id) ?? goal.currentValue)
			: goal.currentValue;
	}

	getGoalProgress(goal: Goal): number {
		const current = this.getGoalCurrent(goal);
		if (goal.direction === 'decrease') {
			const range = goal.startValue - goal.targetValue;
			if (range <= 0) return 0;
			return Math.min(100, Math.max(0, Math.round(((goal.startValue - current) / range) * 100)));
		}
		if (goal.targetValue <= 0) return 0;
		return Math.min(100, Math.round((current / goal.targetValue) * 100));
	}

	// ── Day navigation ───────────────────────────────────────────────────────

	get viewDateStr(): string {
		return format(this.viewDate, 'yyyy-MM-dd');
	}

	get viewDateFormatted(): string {
		if (this.viewDateStr === this.todayStr) {
			return "Today, " + format(this.viewDate, "do 'of' MMMM yyyy");
		}
		return format(this.viewDate, "eeee, do 'of' MMMM yyyy");
	}

	get isToday(): boolean {
		return this.viewDateStr === this.todayStr;
	}

	prevDay(): void {
		this.viewDate = subDays(this.viewDate, 1);
		this.fetchViewDateLog();
	}

	nextDay(): void {
		if (this.isToday) return;
		this.viewDate = addDays(this.viewDate, 1);
		this.fetchViewDateLog();
	}

	goToToday(): void {
		this.viewDate = new Date();
		this.fetchViewDateLog();
	}

	onDateSelected(dateStr: string): void {
		this.viewDate = parseISO(dateStr);
		this.fetchViewDateLog();
	}

	private fetchViewDateLog(): void {
		const userId = localStorage.getItem('id') ?? '';
		this.dailyLogService.getLog(userId, this.viewDateStr).subscribe((log) => {
			this.viewDateLog = log;
		});
	}

	saveExtraCalories(grossValue: number): void {
		const userId = localStorage.getItem('id') ?? '';
		// Subtract logged cardio so we don't double-count
		const net = Math.max(0, grossValue - this.dayCardioCalories);
		this.extraCaloriesSaving = true;

		const update = { extraCaloriesBurned: net };

		const obs = this.viewDateLog?._id
			? this.dailyLogService.updateLog(this.viewDateLog._id, update)
			: this.dailyLogService.createLog({ userId, date: this.viewDateStr, meals: [], ...update });

		obs.subscribe({
			next: (log) => {
				this.viewDateLog = log;
				this.weeklyDailyLogs = this.weeklyDailyLogs.map(l => l.date === log.date ? log : l);
				if (!this.weeklyDailyLogs.some(l => l.date === log.date)) this.weeklyDailyLogs = [...this.weeklyDailyLogs, log];
				this.computeDailyBreakdowns();
				this.extraCaloriesSaving = false;
			},
			error: () => { this.extraCaloriesSaving = false; },
		});
	}

	// ── Weekly stats ────────────────────────────────────────────────────────

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

	get weeklyCaloriesOutPct(): number {
		if (!this.weeklyMaintenance) return 0;
		return Math.min(100, (this.weeklyTotalCaloriesBurned / this.weeklyMaintenance) * 100);
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
		const bmrDaily = this.user?.bmr ?? 0;
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

	/** Get calories out per day (BMR only if day is done, plus activity) */
	getDailyCaloriesOut(dateStr: string): number {
		return (this.dailyBreakdowns[dateStr] ?? this.getDailyBreakdown(dateStr)).calsOut;
	}

	// ── Recent activity ──────────────────────────────────────────────────────

	get recentActivity(): ActivityEntry[] {
		const strengthEntries: ActivityEntry[] = this.workoutRecords.map((r) => ({
			date: r.date,
			type: 'Strength',
			name: this.workouts.find((w) => w._id === r.workoutId)?.name ?? 'Strength Session',
			duration: r.duration,
		}));

		const cardioEntries: ActivityEntry[] = this.conditioningRecords.map((r) => ({
			date: r.date,
			type: 'Cardio',
			name: this.conditioningSessions.find((s) => s._id === r.sessionId)?.name ?? 'Cardio Session',
			duration: r.duration,
		}));

		return [...strengthEntries, ...cardioEntries]
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 8);
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

	// ── Upcoming schedule ────────────────────────────────────────────────────

	get upcomingDays(): { label: string; day: DayPlan | undefined }[] {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		return [1, 2, 3].map((offset) => {
			const date = addDays(new Date(), offset);
			const dayName = dayNames[date.getDay()];
			return {
				label: format(date, 'EEE, MMM d'),
				day: this.weekPlan?.getDayPlan(dayName),
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

	// ── My Day ───────────────────────────────────────────────────────────────

	private toDateStr(date: string | Date): string {
		if (typeof date === 'string') {
			return date.length === 10 ? date : format(new Date(date), 'yyyy-MM-dd');
		}
		return format(date, 'yyyy-MM-dd');
	}

	get viewDayMealObjects(): Meal[] {
		if (!this.viewDateLog) return [];
		return this.viewDateLog.meals
			.map((id) => this.allMeals.find((m) => m._id === id))
			.filter((m): m is Meal => !!m);
	}

	get viewDayWorkouts(): WorkoutRecord[] {
		return this.workoutRecords.filter((r) => this.toDateStr(r.date) === this.viewDateStr);
	}

	get viewDayCardio(): ConditioningRecord[] {
		return this.conditioningRecords.filter((r) => this.toDateStr(r.date) === this.viewDateStr);
	}

	get dayWorkoutSets(): number {
		return this.viewDayWorkouts.reduce((sum, r) =>
			sum + r.exercises.reduce((s, e) => s + e.sets.length, 0), 0);
	}

	get dayWorkoutReps(): number {
		return this.viewDayWorkouts.reduce((sum, r) =>
			sum + r.exercises.reduce((s, e) =>
				s + e.sets.reduce((rs, set) => rs + (set.reps || 0), 0), 0), 0);
	}

	get dayWorkoutVolume(): number {
		return this.viewDayWorkouts.reduce((sum, r) =>
			sum + r.exercises.reduce((s, e) =>
				s + e.sets.reduce((rs, set) => rs + ((set.reps || 0) * (set.weight || 0)), 0), 0), 0);
	}

	get dayWorkoutDuration(): number {
		return this.viewDayWorkouts.reduce((sum, r) => sum + (r.duration || 0), 0);
	}

	get dayCardioSessions(): number {
		return this.viewDayCardio.length;
	}

	get dayCardioDuration(): number {
		return this.viewDayCardio.reduce((sum, r) => sum + (r.duration || 0), 0);
	}

	get dayCardioCalories(): number {
		return this.viewDayCardio.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);
	}

	get totalCaloriesEaten(): number {
		return this.viewDayMealObjects.reduce((sum, m) => sum + m.calories, 0);
	}

	get totalCaloriesBurned(): number {
		const cardio = this.viewDayCardio.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0);
		const extra = this.viewDateLog?.extraCaloriesBurned ?? 0;
		return cardio + extra;
	}

	/** Net energy balance: eaten − burned − maintenance. Negative = deficit, positive = surplus. */
	get dailyCalorieBalance(): number {
		const maintenance = this.user?.bmr ?? 0;
		return this.totalCaloriesEaten - this.totalCaloriesBurned - maintenance;
	}

	/** Total energy out for the day: maintenance + all burned calories. */
	get totalEnergyOut(): number {
		return (this.user?.bmr ?? 0) + this.totalCaloriesBurned;
	}

	get goalVsMaintenance(): { diff: number; type: 'deficit' | 'surplus' | 'on-track' } | null {
		const goal = this.user?.macroGoals?.calories;
		const bmr = this.user?.bmr;
		if (!goal || !bmr) return null;
		const diff = goal - bmr;
		if (Math.abs(diff) < 50) return { diff: 0, type: 'on-track' };
		return { diff: Math.abs(diff), type: diff < 0 ? 'deficit' : 'surplus' };
	}

	get calorieBudgetStatus(): 'deficit' | 'maintenance' | 'surplus' {
		const maintenance = this.user?.bmr;
		if (!maintenance) return 'maintenance';
		const balance = this.dailyCalorieBalance;
		if (balance > 100) return 'surplus';
		if (balance < -100) return 'deficit';
		return 'maintenance';
	}

	get dayWorkoutDetails(): { name: string }[] {
		return this.viewDayWorkouts.map(r => {
			const w = this.workouts.find(w => w._id === r.workoutId);
			return { name: w?.name ?? 'Workout' };
		});
	}

	get totalProtein(): number {
		return this.viewDayMealObjects.reduce((sum, m) => sum + m.protein, 0);
	}

	get totalCarbs(): number {
		return this.viewDayMealObjects.reduce((sum, m) => sum + m.carbs, 0);
	}

	get totalFat(): number {
		return this.viewDayMealObjects.reduce((sum, m) => sum + m.fat, 0);
	}

	get filteredMealLibrary(): Meal[] {
		const { search, category, calorieMin, calorieMax } = this.mealPickerFilter;
		return this.allMeals.filter(m => {
			if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
			if (category && !m.categories?.includes(category)) return false;
			if (calorieMin != null && m.calories < calorieMin) return false;
			if (calorieMax != null && m.calories > calorieMax) return false;
			return true;
		});
	}

	onMealPickerFilterChange(filter: MealFilterValue): void {
		this.mealPickerFilter = filter;
	}

	get mealAlreadyLoggedIds(): Set<string> {
		return new Set(this.viewDateLog?.meals ?? []);
	}

	openMealPicker(): void {
		this.mealPickerDrawer.open();
	}

	addMealToDay(meal: Meal): void {
		const userId = localStorage.getItem('id') ?? '';
		const currentIds = this.viewDateLog?.meals ?? [];

		if (this.viewDateLog?._id) {
			const updated = [...currentIds, meal._id];
			this.dailyLogService.updateLog(this.viewDateLog._id, { meals: updated }).subscribe((log) => {
				this.viewDateLog = log;
			});
		} else {
			this.dailyLogService
				.createLog({ userId, date: this.viewDateStr, meals: [meal._id] })
				.subscribe((log) => {
					this.viewDateLog = log;
				});
		}
	}

	removeMealFromDay(mealId: string): void {
		if (!this.viewDateLog?._id) return;
		const updated = [...this.viewDateLog.meals];
		const idx = updated.findIndex(id => id === mealId);
		if (idx !== -1) updated.splice(idx, 1);
		this.dailyLogService.updateLog(this.viewDateLog._id, { meals: updated }).subscribe((log) => {
			this.viewDateLog = log;
		});
	}

	// ── Workout logging ──────────────────────────────────────────────────────

	logWorkoutDrawerOpen = false;
	logWorkoutInitialRecord: WorkoutRecord | null = null;

	openLogWorkout(): void {
		this.logWorkoutInitialRecord = null;
		this.lastWorkoutRecord = [...this.workoutRecords]
			.filter(r => this.toDateStr(r.date) < this.viewDateStr)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
		this.logWorkoutDrawerOpen = true;
		this.logWorkoutDrawer.open();
	}

	onWorkoutRecordSaved(record: WorkoutRecord): void {
		const idx = this.workoutRecords.findIndex(r => r._id === record._id);
		if (idx >= 0) this.workoutRecords = this.workoutRecords.map(r => r._id === record._id ? record : r);
		else this.workoutRecords = [...this.workoutRecords, record];
	}

	closeLogWorkoutDrawer(): void {
		this.logWorkoutDrawerOpen = false;
		this.logWorkoutDrawer.close();
	}

	// ── Cardio logging ───────────────────────────────────────────────────────

	openLogCardio(): void {
		this.logCardioInitialRecord = null;
		this.logCardioSessionToView = null;
		this.logCardioDrawerOpen = true;
		this.logCardioDrawer.open();
	}

	onCardioRecordSaved(record: ConditioningRecord): void {
		const idx = this.conditioningRecords.findIndex(r => r._id === record._id);
		if (idx >= 0) this.conditioningRecords = this.conditioningRecords.map(r => r._id === record._id ? record : r);
		else this.conditioningRecords = [...this.conditioningRecords, record];
		this.computeDailyBreakdowns();
	}

	closeLogCardioDrawer(): void {
		this.logCardioDrawerOpen = false;
		this.logCardioDrawer.close();
	}

	removeWorkoutRecord(record: WorkoutRecord): void {
		this.workoutRecordService.deleteWorkoutRecord(record._id).subscribe(() => {
			this.workoutRecords = this.workoutRecords.filter(r => r._id !== record._id);
		});
	}

	removeCardioRecord(record: ConditioningRecord): void {
		this.conditioningRecordService.deleteConditioningRecord(record._id).subscribe(() => {
			this.conditioningRecords = this.conditioningRecords.filter(r => r._id !== record._id);
			this.computeDailyBreakdowns();
		});
	}

	// ── Day's Plan ───────────────────────────────────────────────────────────

	get viewDayPlanned(): { workouts: Workout[]; conditioning: ConditioningSession[] } {
		const dayName = format(this.viewDate, 'EEEE');
		return {
			workouts: this.weekPlan?.getAllWorkouts(dayName) ?? [],
			conditioning: this.weekPlan?.getAllConditioning(dayName) ?? [],
		};
	}

	isWorkoutLoggedToday(workoutId: string): boolean {
		return this.viewDayWorkouts.some(r => r.workoutId === workoutId);
	}

	isCardioLoggedToday(sessionId: string): boolean {
		return this.viewDayCardio.some(r => r.sessionId === sessionId);
	}

	isWorkoutPlannedToday(workoutId: string): boolean {
		return this.viewDayPlanned.workouts.some(w => w._id === workoutId);
	}

	isCardioPlannedToday(sessionId: string): boolean {
		return this.viewDayPlanned.conditioning.some(s => s._id === sessionId);
	}

	openLogWorkoutForPlanned(workout: Workout): void {
		const record = WorkoutRecord.fromWorkoutTemplate(workout);
		record.date = this.viewDateStr;
		this.logWorkoutInitialRecord = record;
		this.lastWorkoutRecord = [...this.workoutRecords]
			.filter(r => r.workoutId === workout._id && this.toDateStr(r.date) < this.viewDateStr)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
		this.logWorkoutDrawerOpen = true;
		this.logWorkoutDrawer.open();
	}

	openLogCardioForPlanned(session: ConditioningSession): void {
		this.logCardioInitialRecord = new ConditioningRecord({ date: this.viewDateStr, sessionId: session._id });
		this.logCardioSessionToView = null;
		this.logCardioDrawerOpen = true;
		this.logCardioDrawer.open();
	}

	// ── Helpers ──────────────────────────────────────────────────────────────

	getWorkoutName(workoutId: string): string {
		return this.workouts.find((w) => w._id === workoutId)?.name ?? 'Strength Session';
	}

	getCardioName(sessionId: string): string {
		return this.conditioningSessions.find((s) => s._id === sessionId)?.name ?? 'Cardio Session';
	}

	formatDate(dateStr: string): string {
		try {
			return format(parseISO(dateStr), 'dd MMM yyyy');
		} catch {
			return dateStr;
		}
	}
}
