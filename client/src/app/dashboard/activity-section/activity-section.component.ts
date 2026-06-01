import { Component, EventEmitter, Input, Output } from '@angular/core';

type SectionColor = 'emerald' | 'blue' | 'green';

@Component({
	selector: 'app-activity-section',
	templateUrl: './activity-section.component.html',
	styles: [':host { display: block; }'],
	standalone: false,
})
export class ActivitySectionComponent {
	@Input() icon = '';
	@Input() title = '';
	@Input() color: SectionColor = 'emerald';
	@Input() actionLabel = 'Add';
	@Input() emptyMessage = '';
	@Input() isEmpty = false;

	@Output() action = new EventEmitter<void>();

	private readonly chips: Record<SectionColor, string> = {
		emerald: 'bg-emerald-100 text-emerald-600',
		blue:    'bg-blue-100 text-blue-600',
		green:   'bg-green-100 text-green-600',
	};

	get chipBg(): string { return this.chips[this.color].split(' ')[0]; }
	get chipText(): string { return this.chips[this.color].split(' ')[1]; }
}
