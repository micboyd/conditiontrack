import { Component, OnInit, ViewChild } from '@angular/core';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { Goal } from './models/Goal';
import { GoalsService } from './goals.service';

@Component({
	selector: 'app-goals',
	templateUrl: './goals.component.html',
	standalone: false,
})
export class GoalsComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	goals: Goal[] = [];
	loading = false;
	selectedGoal: Goal | null = null;
	autoValues = new Map<string, number>();

	constructor(private goalsService: GoalsService) {}

	ngOnInit(): void {
		this.loadGoals();
	}

	loadGoals(): void {
		this.loading = true;
		this.goalsService.getAllGoals().subscribe({
			next: (goals) => {
				this.goals = goals.map(g => new Goal(g));
				this.loading = false;
				this.goalsService.resolveAutoValues(this.goals).subscribe(map => {
					this.autoValues = map;
				});
			},
			error: () => { this.loading = false; },
		});
	}

	getCurrentValue(goal: Goal): number {
		if (goal.trackingType === 'auto') {
			return this.autoValues.get(goal._id) ?? goal.currentValue;
		}
		return goal.currentValue;
	}

	getProgress(goal: Goal): number {
		const current = this.getCurrentValue(goal);
		if (goal.direction === 'decrease') {
			const range = goal.startValue - goal.targetValue;
			if (range <= 0) return 0;
			return Math.min(100, Math.max(0, Math.round(((goal.startValue - current) / range) * 100)));
		}
		if (goal.targetValue <= 0) return 0;
		return Math.min(100, Math.round((current / goal.targetValue) * 100));
	}

	getCategoryColor(category: string): string {
		const map: Record<string, string> = {
			'strength':         'bg-blue-100 text-blue-700',
			'cardio':           'bg-green-100 text-green-700',
			'nutrition':        'bg-amber-100 text-amber-700',
			'body-composition': 'bg-purple-100 text-purple-700',
		};
		return map[category] ?? 'bg-zinc-100 text-zinc-600';
	}

	getCategoryIcon(category: string): string {
		const map: Record<string, string> = {
			'strength':         'fa-dumbbell',
			'cardio':           'fa-person-running',
			'nutrition':        'fa-utensils',
			'body-composition': 'fa-weight-scale',
		};
		return map[category] ?? 'fa-bullseye';
	}

	openDrawer(goal: Goal | null): void {
		this.selectedGoal = goal;
		this.drawer.open();
	}

	onDrawerClosed(): void {
		this.loadGoals();
	}

	markComplete(goal: Goal): void {
		this.goalsService.markComplete(goal._id).subscribe(() => {
			this.goals = this.goals.filter(g => g._id !== goal._id);
		});
	}

	deleteGoal(goal: Goal): void {
		this.goalsService.deleteGoal(goal._id).subscribe(() => {
			this.goals = this.goals.filter(g => g._id !== goal._id);
		});
	}

	updateManualProgress(goal: Goal, newValue: number): void {
		this.goalsService.updateGoal(goal._id, { currentValue: newValue }).subscribe(updated => {
			const idx = this.goals.findIndex(g => g._id === updated._id);
			if (idx !== -1) this.goals[idx] = new Goal(updated);
		});
	}
}
