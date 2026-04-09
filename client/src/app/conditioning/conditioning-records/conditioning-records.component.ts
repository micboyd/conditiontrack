import { Component, OnInit, ViewChild } from '@angular/core';

import { ConditioningLibraryService } from '../conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../models/ConditioningRecord';
import { ConditioningRecordService } from './conditioning-records.service';
import { ConditioningSession } from '../models/ConditioningSession';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { format, parseISO } from 'date-fns';

@Component({
	selector: 'app-conditioning-records',
	standalone: false,
	templateUrl: './conditioning-records.component.html',
})
export class ConditioningRecordsComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;

	selectedConditioningRecord: ConditioningRecord | null = null;
	loading = false;

	private _allRecords: ConditioningRecord[] = [];
	private _allSessions: ConditioningSession[] = [];

	constructor(
		public conditioningRecordService: ConditioningRecordService,
		public conditioningLibraryService: ConditioningLibraryService,
	) {}

	ngOnInit(): void {
		this.getAllRecords();
		this.getAllSessions();
	}

	get allConditioningRecords(): ConditioningRecord[] {
		return this._allRecords;
	}

	get allConditioningSessions(): ConditioningSession[] {
		return this._allSessions;
	}

	formatDate(dateInput: string): string {
		try {
			return format(parseISO(dateInput), 'dd MMM yyyy');
		} catch {
			return dateInput;
		}
	}

	openDrawer(record: ConditioningRecord | null): void {
		this.selectedConditioningRecord = record;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.getAllRecords();
	}

	getSessionNameById(sessionId: string): string {
		return this._allSessions.find((s) => s._id === sessionId)?.name ?? '—';
	}

	getAllSessions() {
		this.conditioningLibraryService.getAllConditioningSessions().subscribe((sessions) => {
			this._allSessions = sessions;
		});
	}

	getAllRecords() {
		this.loading = true;
		this.conditioningRecordService.getAllConditioningRecords().subscribe((records) => {
			this._allRecords = records;
			this.loading = false;
		});
	}

	deleteRecord(record: ConditioningRecord): void {
		this.conditioningRecordService.deleteConditioningRecord(record._id).subscribe(() => {
			this.getAllRecords();
		});
	}
}
