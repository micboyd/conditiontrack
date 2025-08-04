import { Component } from '@angular/core';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-nutrition',
	templateUrl: './nutrition.component.html',
	standalone: false,
})
export class NutritionComponent {
	menuItems: MenuItem[] = [{ route: '/nutrition/meal-library', label: 'Meal Library' }];

	constructor() {}
}

