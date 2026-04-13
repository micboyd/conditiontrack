import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	standalone: false,
})
export class MenuComponent implements OnInit {
	user: UserProfile | null = null;
	initials = '';
	menuOpen = false;
	isReady = false;

	constructor(private userService: UserService, private router: Router) {}

	ngOnInit(): void {
		const id = localStorage.getItem('id');
		if (id) {
			this.userService.getUser(id).subscribe({
				next: (user) => {
					this.user = user;
					this.initials = `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase();
				},
			});
		}

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.menuOpen = false;
			});
	}

	toggleMenu(): void {
		if (!this.isReady) this.isReady = true;
		this.menuOpen = !this.menuOpen;
	}

	@HostListener('document:keydown.escape')
	onEsc(): void {
		if (this.menuOpen) this.toggleMenu();
	}
}
