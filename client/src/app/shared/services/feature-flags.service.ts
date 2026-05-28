import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { UserProfile } from './user.service';

// ── Flag registry ─────────────────────────────────────────────────────────────
// To add a new module toggle:
//  1. Add its name to FeatureFlag
//  2. Add a default value to DEFAULT_FLAGS
//  3. Add its mapping from UserProfile in initFromUser()
//  4. Add the boolean field to the UserProfile interface and User mongoose schema
// ─────────────────────────────────────────────────────────────────────────────

export type FeatureFlag = 'nutrition';
// Future: 'nutrition' | 'goals' | 'progress' | 'trainingBlocks'

interface FeatureFlags {
	nutrition: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
	nutrition: true,
};

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
	private _flags$ = new BehaviorSubject<FeatureFlags>({ ...DEFAULT_FLAGS });

	/** Observable of all flags — seldom needed directly; prefer flag$() */
	readonly flags$ = this._flags$.asObservable();

	/** Observable for a single flag. Only emits when that flag's value changes. */
	flag$(name: FeatureFlag): Observable<boolean> {
		return this._flags$.pipe(
			map(f => f[name]),
			distinctUntilChanged()
		);
	}

	/** Synchronous snapshot — useful in route guards after first load. */
	snapshot(name: FeatureFlag): boolean {
		return this._flags$.getValue()[name];
	}

	/**
	 * Populate all flags from the fetched user profile.
	 * Called automatically by UserService.getUser() via tap().
	 */
	initFromUser(user: UserProfile): void {
		this._flags$.next({
			nutrition: user.nutritionEnabled !== false,
			// Future: goals: user.goalsEnabled !== false,
		});
	}

	/**
	 * Optimistically push a flag change to all subscribers without an HTTP call.
	 * Call this before (or instead of waiting for) the server round-trip so the
	 * UI reacts immediately. Revert by calling again with the opposite value.
	 */
	setFlag(name: FeatureFlag, enabled: boolean): void {
		this._flags$.next({ ...this._flags$.getValue(), [name]: enabled });
	}
}
