import { Component } from '@angular/core';
import { ConditioningRecord } from '../models/ConditioningRecord';

@Component({
	selector: 'app-conditioning-records',
	standalone: false,
	templateUrl: './conditioning-records.component.html',
})
export class ConditioningRecordsComponent {
	editModeEnabled: boolean = false;
	mealsLoading: boolean = false;
	selectedConditioningRecord: ConditioningRecord | null = null;
	private _allRecords: Array<ConditioningRecord> = [];

	openEditMode(conditioningSession: ConditioningRecord | null): void {
		this.selectedConditioningRecord = conditioningSession ?? null;
		this.editModeEnabled = true;
	}

	closeEditMode(): void {
		this.editModeEnabled = false;
	}
}
