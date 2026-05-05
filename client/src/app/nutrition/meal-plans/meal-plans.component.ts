import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { addDays, addWeeks, format, isToday, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { Meal } from '../models/Meal';
import { MacroGoals, UserService } from '../../shared/services/user.service';
import { MealPlan } from '../models/MealPlan';
import { MealLibraryService } from '../meal-library/meal-library.service';
import { MealPlansService } from './meal-plans.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-meal-plans',
	templateUrl: './meal-plans.component.html',
	standalone: false,
})
export class MealPlansComponent implements OnInit, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	readonly DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	readonly DAY_ABBR: Record<string, string> = {
		Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
		Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
	};
	readonly SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
	readonly SLOT_ICONS: Record<string, string> = {
		Breakfast: 'fa-mug-hot',
		Lunch: 'fa-bowl-food',
		Dinner: 'fa-utensils',
		Snack: 'fa-apple-whole',
	};
	readonly CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

	currentWeekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 });

	plan: MealPlan = { userId: '', weekStart: '', entries: [] };
	allMeals: Meal[] = [];

	loading = false;
	saving = false;
	saved = false;
	showClearModal = false;

	copiedEntries: { day: string; slot: string; mealId: string }[] | null = null;
	copiedFromWeekStart: string | null = null;

	// Mobile view
	selectedMobileDay = 'Monday';

	// Macro goals
	macroGoals: MacroGoals | null = null;

	// Picker drawer state
	pickerDay = '';
	pickerSlot = '';
	pickerSearch = '';
	pickerCategory = 'All';

	private savedTimer?: ReturnType<typeof setTimeout>;

	constructor(
		private mealLibraryService: MealLibraryService,
		private mealPlansService: MealPlansService,
		private userService: UserService,
	) {}

	ngOnDestroy(): void {
		clearTimeout(this.savedTimer);
	}

	ngOnInit(): void {
		const id = localStorage.getItem('id') ?? '';
		this.userService.getUser(id).subscribe({
			next: user => { this.macroGoals = user.macroGoals ?? null; },
		});
		this.loadMeals();
	}

	// ─── Week helpers ────────────────────────────────────────────────────────

	get weekStartStr(): string {
		return format(this.currentWeekStart, 'yyyy-MM-dd');
	}

	get weekLabel(): string {
		const end = addDays(this.currentWeekStart, 6);
		return `${format(this.currentWeekStart, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
	}

	get isCurrentWeek(): boolean {
		return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') === this.weekStartStr;
	}

	get dayColumns(): { name: string; abbr: string; dayNum: string; month: string; isToday: boolean }[] {
		return this.DAYS.map((name, i) => {
			const date = addDays(this.currentWeekStart, i);
			return {
				name,
				abbr: this.DAY_ABBR[name],
				dayNum: format(date, 'd'),
				month: format(date, 'MMM'),
				isToday: isToday(date),
			};
		});
	}

	prevWeek(): void {
		this.currentWeekStart = subWeeks(this.currentWeekStart, 1);
		this.selectedMobileDay = 'Monday';
		this.loadPlan();
	}

	nextWeek(): void {
		this.currentWeekStart = addWeeks(this.currentWeekStart, 1);
		this.selectedMobileDay = 'Monday';
		this.loadPlan();
	}

	goToCurrentWeek(): void {
		this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
		this.selectedMobileDay = 'Monday';
		this.loadPlan();
	}

	goToWeek(dateStr: string): void {
		this.currentWeekStart = startOfWeek(parseISO(dateStr), { weekStartsOn: 1 });
		this.selectedMobileDay = 'Monday';
		this.loadPlan();
	}

	// ─── Grid data ───────────────────────────────────────────────────────────

	getMealsForSlot(day: string, slot: string): Meal[] {
		return this.plan.entries
			.filter(e => e.day === day && e.slot === slot)
			.map(e => this.allMeals.find(m => m._id === e.mealId))
			.filter((m): m is Meal => m !== undefined);
	}

	getDayCalories(day: string): number {
		return this.plan.entries
			.filter(e => e.day === day)
			.reduce((sum, e) => sum + (this.allMeals.find(m => m._id === e.mealId)?.calories || 0), 0);
	}

	getDayMacros(day: string): { protein: number; carbs: number; fat: number } {
		const raw = this.plan.entries
			.filter(e => e.day === day)
			.reduce(
				(t, e) => {
					const meal = this.allMeals.find(m => m._id === e.mealId);
					return { protein: t.protein + (meal?.protein || 0), carbs: t.carbs + (meal?.carbs || 0), fat: t.fat + (meal?.fat || 0) };
				},
				{ protein: 0, carbs: 0, fat: 0 },
			);
		return {
			protein: Math.round(raw.protein * 10) / 10,
			carbs:   Math.round(raw.carbs   * 10) / 10,
			fat:     Math.round(raw.fat     * 10) / 10,
		};
	}

	copyDayToNext(dayName: string): void {
		const idx = this.DAYS.indexOf(dayName);
		if (idx < 0 || idx >= this.DAYS.length - 1) return;
		const nextDay = this.DAYS[idx + 1];
		this.plan.entries = [
			...this.plan.entries.filter(e => e.day !== nextDay),
			...this.plan.entries.filter(e => e.day === dayName).map(e => ({ ...e, day: nextDay })),
		];
		this.autoSave();
	}

	hasMealsThisWeek(): boolean {
		return this.plan.entries.length > 0;
	}

	// ─── Weekly macro widget ─────────────────────────────────────────────────

	get weeklyCaloriesPlanned(): number {
		return this.DAYS.reduce((sum, day) => sum + this.getDayCalories(day), 0);
	}

	get weeklyProteinPlanned(): number {
		return this.DAYS.reduce((sum, day) => sum + this.getDayMacros(day).protein, 0);
	}

	get weeklyCarbsPlanned(): number {
		return this.DAYS.reduce((sum, day) => sum + this.getDayMacros(day).carbs, 0);
	}

	get weeklyFatPlanned(): number {
		return this.DAYS.reduce((sum, day) => sum + this.getDayMacros(day).fat, 0);
	}

	macroProgress(value: number, goal: number): number {
		if (!goal) return 0;
		return Math.min(100, Math.round((value / goal) * 100));
	}

	// ─── Clear week modal ────────────────────────────────────────────────────

	openClearModal(): void {
		this.showClearModal = true;
	}

	cancelClearModal(): void {
		this.showClearModal = false;
	}

	confirmClearWeek(): void {
		this.showClearModal = false;
		this.plan.entries = [];
		this.autoSave();
	}

	// ─── Copy / Paste week ───────────────────────────────────────────────────

	get canPaste(): boolean {
		return !!this.copiedEntries && this.copiedFromWeekStart !== this.weekStartStr;
	}

	copyCurrentWeek(): void {
		this.copiedEntries = this.plan.entries.map(e => ({ ...e }));
		this.copiedFromWeekStart = this.weekStartStr;
	}

	pasteWeek(): void {
		if (!this.copiedEntries) return;
		this.plan.entries = this.copiedEntries.map(e => ({ ...e }));
		this.autoSave();
	}

	// ─── Picker ──────────────────────────────────────────────────────────────

	openPicker(day: string, slot: string): void {
		this.pickerDay = day;
		this.pickerSlot = slot;
		this.pickerSearch = '';
		this.pickerCategory = slot; // pre-filter to matching slot category
		this.drawer.open();
	}

	get filteredPickerMeals(): Meal[] {
		return this.allMeals.filter(m => {
			const matchSearch = !this.pickerSearch || m.name.toLowerCase().includes(this.pickerSearch.toLowerCase());
			const matchCat = this.pickerCategory === 'All' || m.categories?.includes(this.pickerCategory);
			return matchSearch && matchCat;
		});
	}

	isMealInCurrentSlot(mealId: string): boolean {
		return this.plan.entries.some(e => e.day === this.pickerDay && e.slot === this.pickerSlot && e.mealId === mealId);
	}

	toggleMeal(meal: Meal): void {
		const idx = this.plan.entries.findIndex(e => e.day === this.pickerDay && e.slot === this.pickerSlot && e.mealId === meal._id);
		if (idx >= 0) {
			this.plan.entries.splice(idx, 1);
		} else {
			this.plan.entries.push({ day: this.pickerDay, slot: this.pickerSlot, mealId: meal._id });
		}
		this.autoSave();
	}

	removeMeal(day: string, slot: string, mealId: string, event: Event): void {
		event.stopPropagation();
		this.plan.entries = this.plan.entries.filter(e => !(e.day === day && e.slot === slot && e.mealId === mealId));
		this.autoSave();
	}

	// ─── Data loading ────────────────────────────────────────────────────────

	private loadMeals(): void {
		this.loading = true;
		this.mealLibraryService.getAllMeals().subscribe({
			next: meals => {
				this.allMeals = meals;
				this.loadPlan();
			},
			error: () => { this.loading = false; },
		});
	}

	private loadPlan(): void {
		const userId = localStorage.getItem('id') || '';
		this.loading = true;
		this.mealPlansService.getPlanByWeek(userId, this.weekStartStr).subscribe({
			next: plan => {
				this.plan = plan ?? { userId, weekStart: this.weekStartStr, entries: [] };
				this.loading = false;
			},
			error: () => {
				const uid = localStorage.getItem('id') || '';
				this.plan = { userId: uid, weekStart: this.weekStartStr, entries: [] };
				this.loading = false;
			},
		});
	}

	private autoSave(): void {
		const userId = localStorage.getItem('id') || '';
		this.plan.userId = userId;
		this.plan.weekStart = this.weekStartStr;
		this.saving = true;
		this.saved = false;
		this.mealPlansService.savePlan(this.plan).subscribe({
			next: saved => {
				this.plan = saved;
				this.saving = false;
				this.saved = true;
				clearTimeout(this.savedTimer);
				this.savedTimer = setTimeout(() => (this.saved = false), 2000);
			},
			error: () => { this.saving = false; },
		});
	}
}
