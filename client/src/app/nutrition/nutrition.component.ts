import { Component } from '@angular/core';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-nutrition',
	templateUrl: './nutrition.component.html',
	standalone: false,
})
export class NutritionComponent {
    meunItems: MenuItem[] = [
        { route: '/nutrition/stuff', label: 'Meal Library' }
    ]

	constructor() {}
}
