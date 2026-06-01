import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-page-header',
	templateUrl: './page-header.component.html',
	standalone: false,
})
export class PageHeaderComponent {
	@Input() title = '';
	@Input() actionLabel?: string;
	@Input() actionIcon = 'fa-plus';
	@Input() spacing = 'mb-7';

	@Output() action = new EventEmitter<void>();
}
