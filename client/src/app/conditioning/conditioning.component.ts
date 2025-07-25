import { Component } from '@angular/core';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-conditioning',
	templateUrl: './conditioning.component.html',
	standalone: false,
})
export class ConditioningComponent {

    meunItems: MenuItem[] = [
        { route: '/conditioning/conditioning-sessions', label: 'Record a Session' },
        { route: '/strength/workout-library', label: 'Sessions' }
    ]

	constructor() {}
}
