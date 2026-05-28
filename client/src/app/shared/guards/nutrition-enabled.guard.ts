import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FeatureFlagsService } from '../services/feature-flags.service';

@Injectable({ providedIn: 'root' })
export class NutritionEnabledGuard implements CanActivate {
	constructor(private featureFlags: FeatureFlagsService, private router: Router) {}

	canActivate(): Observable<boolean | UrlTree> {
		return this.featureFlags.flag$('nutrition').pipe(
			take(1),
			map(enabled => enabled ? true : this.router.createUrlTree(['/dashboard']))
		);
	}
}
