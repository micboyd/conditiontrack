import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-strength',
	templateUrl: './strength.component.html',
	standalone: false,
})
export class StrengthComponent {
	workoutForm!: FormGroup;

    meunItems: MenuItem[] = [
        { route: '/strength/workout-records', label: 'Workout Records' },
        { route: '/strength/workout-library', label: 'Workouts' },
        { route: '/strength/exercise-library', label: 'Exercises' }
    ]

	constructor() {}

	ngOnInit() {}
}
