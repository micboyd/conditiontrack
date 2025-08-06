import { Component, OnInit } from '@angular/core';

import { ConditioningLibraryService } from './conditioning-library.service';
import { ConditioningSession } from '../models/ConditioningSession';

@Component({
	selector: 'app-conditioning-library',
	standalone: false,
	templateUrl: './conditioning-library.component.html',
})
export class ConditioningLibraryComponent implements OnInit {
	editModeEnabled: boolean = false;
	mealsLoading: boolean = false;
	selectedConditioningSession: ConditioningSession | null = null;
	private _allSessions: Array<ConditioningSession> = [];

    constructor(public conditioningLibraryService: ConditioningLibraryService) {}

    ngOnInit(): void {
        this.getAllConditioningSessions();
    }

    get conditioningSessions(): Array<ConditioningSession> {
        return this._allSessions;
    }

	openEditMode(conditioningSession: ConditioningSession | null): void {
        this.selectedConditioningSession = conditioningSession ?? null;
		this.editModeEnabled = true;
	}

    getAllConditioningSessions(): void {
        this.conditioningLibraryService.getAllConditioningSessions().subscribe(allSessions => {
            this._allSessions = allSessions;
        })
    }

    deleteConditioningSessions(session: ConditioningSession): void {
        this.conditioningLibraryService.deleteConditioningSession(session._id).subscribe(allSessions => {
            this.getAllConditioningSessions();
        })
    }

	closeEditMode(): void {
		this.editModeEnabled = false;
        this.getAllConditioningSessions();
	}
}
