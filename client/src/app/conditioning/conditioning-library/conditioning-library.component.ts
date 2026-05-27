import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ConditioningLibraryService } from './conditioning-library.service';
import { ConditioningSession } from '../models/ConditioningSession';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-conditioning-library',
	standalone: false,
	templateUrl: './conditioning-library.component.html',
})
export class ConditioningLibraryComponent implements OnInit, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	loading = false;
	searchQuery = '';
	selectedConditioningSession: ConditioningSession | null = null;
	drawerOpen = false;
	private _allSessions: ConditioningSession[] = [];

	private searchSubject = new Subject<string>();
	private searchSub?: Subscription;

	constructor(public conditioningLibraryService: ConditioningLibraryService) {}

	ngOnInit(): void {
		this.searchSub = this.searchSubject.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			switchMap(q => {
				this.loading = true;
				return this.conditioningLibraryService.getAllConditioningSessions(q || undefined);
			}),
		).subscribe(sessions => {
			this._allSessions = sessions;
			this.loading = false;
		});

		this.getAllConditioningSessions();
	}

	ngOnDestroy(): void {
		this.searchSub?.unsubscribe();
	}

	get conditioningSessions(): ConditioningSession[] {
		return this._allSessions;
	}

	onSearchChange(q: string): void {
		this.searchQuery = q;
		this.searchSubject.next(q);
	}

	clearSearch(): void {
		this.searchQuery = '';
		this.searchSubject.next('');
	}

	openDrawer(session: ConditioningSession | null): void {
		this.selectedConditioningSession = session;
		this.drawerOpen = true;
		this.drawer.open();
	}

	getAllConditioningSessions(): void {
		this.loading = true;
		this.conditioningLibraryService.getAllConditioningSessions().subscribe(sessions => {
			this._allSessions = sessions;
			this.loading = false;
		});
	}

	deleteConditioningSessions(session: ConditioningSession): void {
		this.conditioningLibraryService.deleteConditioningSession(session._id).subscribe(() => {
			this.getAllConditioningSessions();
		});
	}

	closeDrawer(): void {
		this.drawerOpen = false;
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.drawerOpen = false;
		this.getAllConditioningSessions();
	}
}
