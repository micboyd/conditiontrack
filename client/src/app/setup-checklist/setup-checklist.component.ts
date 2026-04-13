import { Component, OnInit } from '@angular/core';
import { ChecklistItem, SetupChecklistService } from './setup-checklist.service';

@Component({
	selector: 'app-setup-checklist',
	templateUrl: './setup-checklist.component.html',
	standalone: false,
})
export class SetupChecklistComponent implements OnInit {
	items: ChecklistItem[] = [];
	loading = true;

	readonly categories: { id: string; label: string; icon: string; colorClass: string; bgClass: string }[] = [
		{ id: 'strength',	label: 'Strength',	icon: 'fa-dumbbell',		colorClass: 'text-blue-600',	bgClass: 'bg-blue-50' },
		{ id: 'cardio',		label: 'Cardio',	icon: 'fa-person-running',	colorClass: 'text-green-600',	bgClass: 'bg-green-50' },
		{ id: 'nutrition',	label: 'Nutrition',	icon: 'fa-utensils',		colorClass: 'text-amber-600',	bgClass: 'bg-amber-50' },
		{ id: 'progress',	label: 'Progress',	icon: 'fa-chart-line',		colorClass: 'text-violet-600',	bgClass: 'bg-violet-50' },
		{ id: 'profile',	label: 'Profile',	icon: 'fa-user',			colorClass: 'text-zinc-600',	bgClass: 'bg-zinc-100' },
	];

	constructor(private checklistService: SetupChecklistService) {}

	ngOnInit(): void {
		this.checklistService.getStatus().subscribe({
			next: items => {
				this.items = items;
				this.loading = false;
			},
			error: () => {
				this.loading = false;
			},
		});
	}

	itemsForCategory(categoryId: string): ChecklistItem[] {
		return this.items.filter(i => i.category === categoryId);
	}

	get completedCount(): number {
		return this.items.filter(i => i.completed).length;
	}

	get totalCount(): number {
		return this.items.length;
	}

	get allDone(): boolean {
		return this.completedCount === this.totalCount && this.totalCount > 0;
	}

	get progressPercent(): number {
		if (!this.totalCount) return 0;
		return Math.round((this.completedCount / this.totalCount) * 100);
	}
}
