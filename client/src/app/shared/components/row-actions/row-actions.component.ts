import { Component, EventEmitter, Input, Output } from '@angular/core';

type RowActionsVariant = 'table' | 'card';

@Component({
	selector: 'app-row-actions',
	templateUrl: './row-actions.component.html',
	standalone: false,
})
export class RowActionsComponent {
	@Input() variant: RowActionsVariant = 'table';
	@Input() showView = false;

	@Output() view = new EventEmitter<void>();
	@Output() edit = new EventEmitter<void>();
	@Output() remove = new EventEmitter<void>();

	get wrapperClass(): string {
		return this.variant === 'table' ? 'justify-end' : 'flex-shrink-0';
	}

	get iconClass(): string {
		return this.variant === 'table' ? 'text-sm' : '';
	}
}
