import { Component } from '@angular/core';
import { MenuItem } from '../shared/models/MenuItem';

@Component({
	selector: 'app-global-settings',
	templateUrl: './global-settings.component.html',
	standalone: false,
})
export class GlobalSettingsComponent {
    meunItems: MenuItem[] = [
        { route: '/nutrition/stuff', label: 'Settings' }
    ]

	constructor() {}
}
