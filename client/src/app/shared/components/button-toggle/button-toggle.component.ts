import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-button-toggle',
	standalone: false,
	templateUrl: './button-toggle.component.html',
})
export class ButtonToggleComponent {

    @Input() label: string = '';
	@Input() options: string[] = [];
	@Input() selected: string[] = [];
	@Input() colorClass: string = 'blue';
	@Input() singleSelect = false;

	@Output() selectionChange = new EventEmitter<string[]>();

	toggle(option: string) {
		let newSelection: string[] = [];

		if (this.singleSelect) {
			newSelection = [option];
		} else {
			if (this.selected.includes(option)) {
				newSelection = this.selected.filter(o => o !== option);
			} else {
				newSelection = [...this.selected, option];
			}
		}

		this.selectionChange.emit(newSelection);
	}

	isSelected(option: string): boolean {
		return this.selected.includes(option);
	}

	activeClass(): string {
		const map: Record<string, string> = {
			blue:   'bg-blue-600 text-white border-blue-600',
			green:  'bg-green-600 text-white border-green-600',
			red:    'bg-red-600 text-white border-red-600',
			amber:  'bg-amber-500 text-white border-amber-500',
			purple: 'bg-purple-600 text-white border-purple-600',
			zinc:   'bg-zinc-900 text-white border-zinc-900',
		};
		return map[this.colorClass] ?? 'bg-zinc-900 text-white border-zinc-900';
	}
}
