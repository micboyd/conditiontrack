import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FeatureFlagsService } from '../../services/feature-flags.service';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	standalone: false,
})
export class MenuComponent implements OnInit, OnDestroy {
	user: UserProfile | null = null;
	initials = '';
	menuOpen = false;
	isReady = false;
	nutritionEnabled = true;

	private nutritionSub?: Subscription;

	constructor(
		private userService: UserService,
		private featureFlags: FeatureFlagsService,
		private router: Router,
	) {}

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

		this.nutritionSub = this.featureFlags.flag$('nutrition').subscribe(
			enabled => (this.nutritionEnabled = enabled)
		);

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.menuOpen = false;
			});
	}

	ngOnDestroy(): void {
		this.nutritionSub?.unsubscribe();
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
