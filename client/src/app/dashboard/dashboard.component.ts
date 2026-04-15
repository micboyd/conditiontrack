import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { addDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek, subDays } from 'date-fns';

import { ConditioningLibraryService } from '../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../conditioning/models/ConditioningRecord';
import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { DailyLog } from '../nutrition/models/DailyLog';
import { DailyLogService } from '../shared/services/daily-log.service';
import { DayPlan } from '../week-planner/models/WeekPlan';
import { Meal } from '../nutrition/models/Meal';
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

	// Day navigation
	viewDate: Date = new Date();
	viewDateLog: DailyLog | null = null;

	// Extra (manual) burned calories
	showExtraCalInput = false;
	extraCalInput: number | null = null;
	extraCaloriesSaving = false;

	mealSearchQuery = '';


	// Workout logging state
	logWorkoutStep: 1 | 2 = 1;
	logWorkoutSelectedWorkout: Workout | null = null;
	workoutLogForm!: FormGroup;
	workoutLogErrors: string[] = [];
	workoutLogLoading = false;

	// Cardio logging state
	logCardioStep: 1 | 2 = 1;
	showCardioSessionDetail = false;
	logCardioSelectedSession: ConditioningSession | null = null;
	cardioLogForm!: FormGroup;
	cardioLogLoading = false;

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


	constructor(
		private fb: FormBuilder,
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
			weekPlan: this.weekPlannerService.getAllWeekPlans(),
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
			this.showExtraCalInput = false;
		});
	}

	openExtraCalInput(): void {
		this.extraCalInput = this.viewDateLog?.extraCaloriesBurned ?? null;
		this.showExtraCalInput = true;
	}

	saveExtraCalories(): void {
		const userId = localStorage.getItem('id') ?? '';
		const calories = this.extraCalInput ?? 0;
		this.extraCaloriesSaving = true;

		const update = { extraCaloriesBurned: calories };

		const obs = this.viewDateLog?._id
			? this.dailyLogService.updateLog(this.viewDateLog._id, update)
			: this.dailyLogService.createLog({ userId, date: this.viewDateStr, meals: [], ...update });

		obs.subscribe({
			next: (log) => {
				this.viewDateLog = log;
				this.showExtraCalInput = false;
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

	get weeklyExtraCaloriesBurned(): number {
		return this.weeklyDailyLogs.reduce((sum, log) => sum + (log.extraCaloriesBurned ?? 0), 0);
	}

	get weeklyTotalCaloriesBurned(): number {
		return this.caloriesThisWeek + this.weeklyExtraCaloriesBurned;
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
		return this.weeklyCaloriesEaten - this.weeklyTotalCaloriesBurned - (this.user?.bmr ?? 0) * 7;
	}

	get weeklyCaloriesInPct(): number {
		if (!this.weeklyCalorieTarget) return 0;
		return Math.min(100, (this.weeklyCaloriesEaten / this.weeklyCalorieTarget) * 100);
	}

	get weeklyCaloriesOutPct(): number {
		if (!this.weeklyMaintenance) return 0;
		return Math.min(100, (this.weeklyTotalCaloriesBurned / this.weeklyMaintenance) * 100);
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
		const q = this.mealSearchQuery.trim().toLowerCase();
		if (!q) return this.allMeals;
		return this.allMeals.filter(
			(m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
		);
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

	openLogWorkout(): void {
		this.logWorkoutStep = 1;
		this.logWorkoutSelectedWorkout = null;
		this.workoutLogErrors = [];
		this.logWorkoutDrawer.open();
	}

	selectWorkoutToLog(workout: Workout): void {
		this.logWorkoutSelectedWorkout = workout;
		const record = WorkoutRecord.fromWorkoutTemplate(workout);
		record.date = this.viewDateStr;
		this.workoutLogForm = WorkoutRecord.toFormGroup(record, this.fb);
		this.logWorkoutStep = 2;
	}

	get workoutLogExercises(): FormArray {
		return WorkoutRecord.getExercises(this.workoutLogForm);
	}

	getWorkoutLogSets(i: number): FormArray {
		return WorkoutRecord.getSets(this.workoutLogExercises, i);
	}

	addWorkoutLogSet(i: number): void {
		WorkoutRecord.addSet(this.workoutLogExercises, i, this.fb);
	}

	removeWorkoutLogSet(i: number, j: number): void {
		WorkoutRecord.removeSet(this.workoutLogExercises, i, j);
	}

	saveWorkoutRecord(): void {
		this.workoutLogErrors = [];
		this.workoutLogExercises.controls.forEach((ex, i) => {
			const sets = ex.get('sets') as FormArray;
			if (!sets || sets.length === 0) {
				this.workoutLogErrors.push(`"${ex.get('name')?.value || `Exercise ${i + 1}`}" has no sets.`);
				return;
			}
			sets.controls.forEach((set, j) => {
				const reps = set.get('reps')?.value;
				const weight = set.get('weight')?.value;
				if (reps === null || reps === '' || weight === null || weight === '') {
					this.workoutLogErrors.push(
						`"${ex.get('name')?.value || `Exercise ${i + 1}`}", Set ${j + 1} is incomplete.`,
					);
				}
			});
		});

		if (this.workoutLogErrors.length > 0) return;
		if (!this.workoutLogForm.valid) return;

		this.workoutLogLoading = true;
		const payload = this.workoutLogForm.value as WorkoutRecord;
		this.workoutRecordService.createWorkoutRecord(payload).subscribe((record) => {
			this.workoutRecords = [...this.workoutRecords, record];
			this.workoutLogLoading = false;
			this.logWorkoutDrawer.close();
		});
	}

	// ── Cardio logging ───────────────────────────────────────────────────────

	openLogCardio(): void {
		this.logCardioStep = 1;
		this.logCardioSelectedSession = null;
		this.logCardioDrawer.open();
	}

	selectSessionToLog(session: ConditioningSession): void {
		this.logCardioSelectedSession = session;
		const record = new ConditioningRecord({ date: this.viewDateStr });
		this.cardioLogForm = ConditioningRecord.createFormGroup(this.fb, record, session);
		this.logCardioStep = 2;
	}

	saveCardioRecord(): void {
		if (!this.cardioLogForm.valid) {
			this.cardioLogForm.markAllAsTouched();
			return;
		}
		this.cardioLogLoading = true;
		this.conditioningRecordService.createConditioningRecord(this.cardioLogForm.value).subscribe((record) => {
			this.conditioningRecords = [...this.conditioningRecords, record];
			this.cardioLogLoading = false;
			this.logCardioDrawer.close();
		});
	}

	removeWorkoutRecord(record: WorkoutRecord): void {
		this.workoutRecordService.deleteWorkoutRecord(record._id).subscribe(() => {
			this.workoutRecords = this.workoutRecords.filter(r => r._id !== record._id);
		});
	}

	removeCardioRecord(record: ConditioningRecord): void {
		this.conditioningRecordService.deleteConditioningRecord(record._id).subscribe(() => {
			this.conditioningRecords = this.conditioningRecords.filter(r => r._id !== record._id);
		});
	}

	// ── Macro progress ───────────────────────────────────────────────────────

	macroProgress(eaten: number, goal: number): number {
		if (!goal) return 0;
		return Math.min(100, Math.round((eaten / goal) * 100));
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

	openLogWorkoutForPlanned(workout: Workout): void {
		this.openLogWorkout();
		// Use setTimeout to allow drawer to open first
		setTimeout(() => this.selectWorkoutToLog(workout), 50);
	}

	openLogCardioForPlanned(session: ConditioningSession): void {
		this.openLogCardio();
		setTimeout(() => this.selectSessionToLog(session), 50);
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
