import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DailyLog } from '../../nutrition/models/DailyLog';
import { UserProfile } from '../../shared/services/user.service';

@Component({
	selector: 'app-daily-totals-card',
	standalone: false,
	templateUrl: './daily-totals-card.component.html',
})
export class DailyTotalsCardComponent {
	@Input() user: UserProfile | null = null;
	@Input() totalCaloriesEaten = 0;
	@Input() totalCaloriesBurned = 0;
	@Input() totalEnergyOut = 0;
	@Input() dailyCalorieBalance = 0;
	@Input() calorieBudgetStatus: 'deficit' | 'maintenance' | 'surplus' = 'maintenance';
	@Input() goalVsMaintenance: { diff: number; type: 'deficit' | 'surplus' | 'on-track' } | null = null;
	@Input() totalProtein = 0;
	@Input() totalCarbs = 0;
	@Input() totalFat = 0;
	@Input() dayCardioCalories = 0;
	@Input() viewDateLog: DailyLog | null = null;

	@Output() saveExtraCalories = new EventEmitter<number>();

	showExtraCalInput = false;
	extraCalInput: number | null = null;

	openExtraCalInput(): void {
		const stored = this.viewDateLog?.extraCaloriesBurned ?? 0;
		this.extraCalInput = stored > 0 ? stored + this.dayCardioCalories : null;
		this.showExtraCalInput = true;
	}

	onSaveExtraCalories(): void {
		this.saveExtraCalories.emit(this.extraCalInput ?? 0);
		this.showExtraCalInput = false;
	}

	macroProgress(eaten: number, goal: number): number {
		if (!goal) return 0;
		return Math.min(100, Math.round((eaten / goal) * 100));
	}
}
