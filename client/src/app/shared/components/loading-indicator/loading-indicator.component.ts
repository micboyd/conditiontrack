import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-loading-indicator',
	templateUrl: './loading-indicator.component.html',
	standalone: false,
})
export class LoadingIndicatorComponent {
	@Input() loading: boolean = false;
	@Input() spinner: boolean = false;

	constructor() {}
}

