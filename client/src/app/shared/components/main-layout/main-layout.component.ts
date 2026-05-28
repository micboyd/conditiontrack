import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ConditioningRecordService } from '../../../conditioning/conditioning-records/conditioning-records.service';
import { DailyLogService } from '../../services/daily-log.service';
import { MealLibraryService } from '../../../nutrition/meal-library/meal-library.service';
import { TrainingBlock } from '../../../training-blocks/models/TrainingBlock';
import { TrainingBlocksService } from '../../../training-blocks/training-blocks.service';
import { UserProfile, UserService } from '../../services/user.service';
import { WorkoutRecordService } from '../../../strength/workout-records/workout-records.service';

@Component({
	selector: 'app-main-layout',
	templateUrl: './main-layout.component.html',
	standalone: false,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
	user: UserProfile | null = null;
	nutritionEnabled = true;
	activeBlock: TrainingBlock | null = null;

	currentMonth = '';
	currentDate = '';
	workoutCount = 0;
	cardioCount = 0;
	kcalBurned = 0;
	kcalEaten = 0;

	private routerSub?: Subscription;
	private nutritionSub?: Subscription;

	constructor(
		private userService: UserService,
		private workoutRecordService: WorkoutRecordService,
		private conditioningRecordService: ConditioningRecordService,
		private dailyLogService: DailyLogService,
		private mealLibraryService: MealLibraryService,
		private trainingBlocksService: TrainingBlocksService,
		private router: Router,
	) {}

	ngOnInit(): void {
		const now = new Date();
		this.currentMonth = now.toLocaleString('default', { month: 'long' });
		this.currentDate = now.toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const id = localStorage.getItem('id');
		if (id) {
			this.userService.getUser(id).subscribe({
				next: (user) => (this.user = user),
			});
			this.loadMonthlyStats(id, now);
			this.loadActiveBlock();
		}

		// React to nutrition toggle changes from any component
		this.nutritionSub = this.userService.nutritionEnabled$.subscribe(
			enabled => (this.nutritionEnabled = enabled)
		);

		this.routerSub = this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(() => {
				const userId = localStorage.getItem('id');
				if (userId) this.loadMonthlyStats(userId, new Date());
			});
	}

	ngOnDestroy(): void {
		this.routerSub?.unsubscribe();
		this.nutritionSub?.unsubscribe();
	}

	get initials(): string {
		return `${this.user?.firstname?.[0] ?? ''}${this.user?.lastname?.[0] ?? ''}`.toUpperCase();
	}

	private loadActiveBlock(): void {
		this.trainingBlocksService.getAllBlocks().subscribe({
			next: (blocks) => {
				this.activeBlock = blocks.map(b => new TrainingBlock(b)).find(b => b.isActive) ?? null;
			},
		});
	}

	private loadMonthlyStats(userId: string, now: Date): void {
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const prefix = `${year}-${String(month).padStart(2, '0')}`;

		this.workoutRecordService.getAllWorkoutRecords().subscribe({
			next: (records) => {
				this.workoutCount = records.filter((r) => r.date?.startsWith(prefix)).length;
			},
		});

		this.conditioningRecordService.getAllConditioningRecords().subscribe({
			next: (records) => {
				const monthRecords = records.filter((r) => r.date?.startsWith(prefix));
				this.cardioCount = monthRecords.length;
				this.kcalBurned = monthRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);
			},
		});

		forkJoin({
			logs: this.dailyLogService.getMonthlyLogs(userId, year, month),
			meals: this.mealLibraryService.getAllMeals(),
		}).subscribe({
			next: ({ logs, meals }) => {
				const mealCalMap = new Map(meals.map((m) => [m._id, m.calories]));
				this.kcalEaten = logs.reduce((total, log) => {
					return total + log.meals.reduce((sum, mealId) => sum + (mealCalMap.get(mealId) || 0), 0);
				}, 0);
			},
		});
	}
}
