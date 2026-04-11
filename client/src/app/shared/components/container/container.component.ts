import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-container',
	templateUrl: './container.component.html',
	standalone: false,
	host: {
		class: 'block w-full max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12',
	},
})
export class ContainerComponent {
	constructor() {}

    @Input() noPadding: boolean = false;
}
