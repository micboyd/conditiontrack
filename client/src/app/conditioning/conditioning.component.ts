import { Component } from '@angular/core';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-conditioning',
	templateUrl: './conditioning.component.html',
	standalone: false,
})
export class ConditioningComponent {

    meunItems: MenuItem[] = [
        { route: '/conditioning/conditioning-records', label: 'Record a Session' },
        { route: '/conditioning/conditioning-library', label: 'Conditioning Library' }
    ]

	constructor() {}
}
