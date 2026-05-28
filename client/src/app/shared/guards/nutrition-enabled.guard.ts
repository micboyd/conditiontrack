import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';

import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';

@Injectable({
	providedIn: 'root',
})
export class NutritionEnabledGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	canActivate(): Observable<boolean | UrlTree> {
		const id = localStorage.getItem('id') ?? '';
		return this.userService.getUser(id).pipe(
			map(user =>
				user.nutritionEnabled !== false
					? true
					: this.router.createUrlTree(['/dashboard'])
			)
		);
	}
}
