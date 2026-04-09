import { Component, OnInit, ViewChild } from '@angular/core';

import { ConditioningLibraryService } from './conditioning-library.service';
import { ConditioningSession } from '../models/ConditioningSession';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

@Component({
	selector: 'app-conditioning-library',
	standalone: false,
	templateUrl: './conditioning-library.component.html',
})
export class ConditioningLibraryComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	loading = false;
	selectedConditioningSession: ConditioningSession | null = null;
	private _allSessions: ConditioningSession[] = [];

	constructor(public conditioningLibraryService: ConditioningLibraryService) {}

	ngOnInit(): void {
		this.getAllConditioningSessions();
	}

	get conditioningSessions(): ConditioningSession[] {
		return this._allSessions;
	}

	openDrawer(session: ConditioningSession | null): void {
		this.selectedConditioningSession = session;
		this.drawer.open();
	}

	getAllConditioningSessions(): void {
		this.loading = true;
		this.conditioningLibraryService.getAllConditioningSessions().subscribe((sessions) => {
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
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.getAllConditioningSessions();
	}
}
