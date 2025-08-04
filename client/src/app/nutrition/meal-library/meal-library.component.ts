import { Component } from '@angular/core';

@Component({
	selector: 'app-meal-library',
	templateUrl: './meal-library.component.html',
	standalone: false,
})
export class MealLibraryComponent {
	editModeEnabled: boolean = false;

	openEditMode(): void {
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.editModeEnabled = false;
	}

	constructor() {}
}

