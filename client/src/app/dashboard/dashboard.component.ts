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
import { forkJoin } from 'rxjs';

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

	// Day navigation
	viewDate: Date = new Date();
	viewDateLog: DailyLog | null = null;

	mealSearchQuery = '';

	// Date picker state
	showDatePicker = false;
	pickerMonth: Date = new Date();

	// Workout logging state
	logWorkoutStep: 1 | 2 = 1;
	logWorkoutSelectedWorkout: Workout | null = null;
	workoutLogForm!: FormGroup;
	workoutLogErrors: string[] = [];
	workoutLogLoading = false;

	// Cardio logging state
	logCardioStep: 1 | 2 = 1;
	logCardioSelectedSession: ConditioningSession | null = null;
	cardioLogForm!: FormGroup;
	cardioLogLoading = false;

	private workoutRecords: WorkoutRecord[] = [];
	private conditioningRecords: ConditioningRecord[] = [];
	workouts: Workout[] = [];
	conditioningSessions: ConditioningSession[] = [];
	private weekPlan: WeekPlan | null = null;
	private allMeals: Meal[] = [];

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
	) {}

	ngOnInit(): void {
		const id = localStorage.getItem('id') ?? '';
		forkJoin({
			user: this.userService.getUser(id),
			workoutRecords: this.workoutRecordService.getAllWorkoutRecords(),
			conditioningRecords: this.conditioningRecordService.getAllConditioningRecords(),
			workouts: this.workoutService.getAllWorkouts(),
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			weekPlan: this.weekPlannerService.getAllWeekPlans(),
			mealLibrary: this.mealLibraryService.getAllMeals(),
			dailyLog: this.dailyLogService.getLog(id, this.todayStr),
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
				this.loading = false;
			},
			error: () => {
				this.loading = false;
			},
		});
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

	// ── Date picker ──────────────────────────────────────────────────────────

	toggleDatePicker(): void {
		if (!this.showDatePicker) {
			this.pickerMonth = new Date(this.viewDate);
		}
		this.showDatePicker = !this.showDatePicker;
	}

	prevPickerMonth(): void {
		const d = new Date(this.pickerMonth);
		d.setMonth(d.getMonth() - 1);
		this.pickerMonth = d;
	}

	nextPickerMonth(): void {
		const d = new Date(this.pickerMonth);
		d.setMonth(d.getMonth() + 1);
		this.pickerMonth = d;
	}

	get pickerMonthLabel(): string {
		return format(this.pickerMonth, 'MMMM yyyy');
	}

	get pickerNextMonthDisabled(): boolean {
		const today = new Date();
		return this.pickerMonth.getFullYear() > today.getFullYear() ||
			(this.pickerMonth.getFullYear() === today.getFullYear() && this.pickerMonth.getMonth() >= today.getMonth());
	}

	get pickerDays(): (Date | null)[] {
		const year = this.pickerMonth.getFullYear();
		const month = this.pickerMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const totalDays = new Date(year, month + 1, 0).getDate();
		const offset = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
		const cells: (Date | null)[] = Array(offset).fill(null);
		for (let d = 1; d <= totalDays; d++) {
			cells.push(new Date(year, month, d));
		}
		return cells;
	}

	selectPickerDate(date: Date): void {
		this.viewDate = date;
		this.showDatePicker = false;
		this.fetchViewDateLog();
	}

	isPickerToday(date: Date): boolean {
		return format(date, 'yyyy-MM-dd') === this.todayStr;
	}

	isPickerSelected(date: Date): boolean {
		return format(date, 'yyyy-MM-dd') === this.viewDateStr;
	}

	isFutureDate(date: Date): boolean {
		return format(date, 'yyyy-MM-dd') > this.todayStr;
	}

	private fetchViewDateLog(): void {
		const userId = localStorage.getItem('id') ?? '';
		this.dailyLogService.getLog(userId, this.viewDateStr).subscribe((log) => {
			this.viewDateLog = log;
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

	get totalCaloriesEaten(): number {
		return this.viewDayMealObjects.reduce((sum, m) => sum + m.calories, 0);
	}

	get totalCaloriesBurned(): number {
		return this.viewDayCardio.reduce((sum, r) => sum + (r.caloriesBurned ?? 0), 0);
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
		const updated = this.viewDateLog.meals.filter((id) => id !== mealId);
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
