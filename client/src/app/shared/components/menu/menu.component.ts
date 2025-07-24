import { Component } from '@angular/core';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	standalone: false,
})
export class MenuComponent {
	constructor() {}

    isMenuOpen = false;

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
	}

	closeMenu() {
		this.isMenuOpen = false;
	}
}
