import { Component } from '@angular/core';
import { format } from 'date-fns';

@Component({
	selector: 'app-container',
	templateUrl: './dashboard.component.html',
	standalone: false,
})
export class DashboardComponent {
	constructor() {}

	todaysDate = new Date();
	formattedDate = format(this.todaysDate, "eeee, do 'of' MMMM yyyy");
}
