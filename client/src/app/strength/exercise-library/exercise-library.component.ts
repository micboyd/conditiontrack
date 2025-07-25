import { Component } from '@angular/core';

@Component({
	selector: 'app-exercise-library',
	templateUrl: './exercise-library.component.html',
	standalone: false,
})

export class ExerciseLibraryComponent {

    editModeEnabled: boolean = false;

	constructor() {}

    openEditMode(): void {
        this.editModeEnabled = true;
    }

    closeEditMode(): void {
        this.editModeEnabled = false;
    }
}
