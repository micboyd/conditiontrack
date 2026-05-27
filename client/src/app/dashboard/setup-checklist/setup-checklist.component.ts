import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-setup-checklist',
	standalone: false,
	templateUrl: './setup-checklist.component.html',
})
export class SetupChecklistComponent {
	@Input() items: { title: string; completed: boolean; route: string }[] = [];
	@Input() doneCount = 0;
	@Input() total = 0;

	get incomplete(): { title: string; route: string }[] {
		return this.items.filter(i => !i.completed).slice(0, 3);
	}

	get remaining(): number {
		return this.total - this.doneCount;
	}
}
