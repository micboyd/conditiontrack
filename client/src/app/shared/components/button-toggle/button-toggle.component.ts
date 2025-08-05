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
}
