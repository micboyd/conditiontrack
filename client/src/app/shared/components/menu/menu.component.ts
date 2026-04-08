import { Component, OnInit } from '@angular/core';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	standalone: false,
})
export class MenuComponent implements OnInit {
	user: UserProfile | null = null;
	initials = '';

	constructor(private userService: UserService) {}

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
	}
}
