import { Component, OnInit } from '@angular/core';

import { ConditioningLibraryService } from '../conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../models/ConditioningRecord';
import { ConditioningRecordService } from './conditioning-records.service';
import { ConditioningSession } from '../models/ConditioningSession';
import { format } from 'date-fns';

@Component({
	selector: 'app-conditioning-records',
	standalone: false,
	templateUrl: './conditioning-records.component.html',
})
export class ConditioningRecordsComponent implements OnInit {
	editModeEnabled: boolean = false;
	mealsLoading: boolean = false;
	selectedConditioningRecord: ConditioningRecord | null = null;

	private _allRecords: Array<ConditioningRecord> = [];
    private _allSessions: Array<ConditioningSession> = [];

    constructor(
        public conditioningRecordService: ConditioningRecordService,
        public conditioningLibraryService: ConditioningLibraryService) {}

    ngOnInit(): void {
        this.getAllRecords();
        this.getAllSessions();
    }

    get allConditioningRecords(): Array<ConditioningRecord> {
        return this._allRecords;
    }

    get allConditioningSessions(): Array<ConditioningSession> {
        return this._allSessions;
    }

    formatDate(dateInput: string): string {
        return format(dateInput, "dd/MM/yyyy");
    }

	openEditMode(conditioningSession: ConditioningRecord | null): void {
		this.selectedConditioningRecord = conditioningSession ?? null;
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.editModeEnabled = false;
        this.getAllRecords();
	}

    getSessionNameById(sessionId: string): string {
        console.log(this.allConditioningSessions);
        const session = this.allConditioningSessions.find((session) => session._id === sessionId);
        return session ? session.name : '';
    }

    getAllSessions() {
        this.conditioningLibraryService.getAllConditioningSessions().subscribe(allSessions => {
            this._allSessions = allSessions;
            console.log(allSessions);
        })
    }

    getAllRecords() {
        this.conditioningRecordService.getAllConditioningRecords().subscribe(allRecords => {
            this._allRecords = allRecords;
        })
    }

}
