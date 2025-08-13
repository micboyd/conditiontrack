import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConditioningLibraryService } from '../../conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../../models/ConditioningRecord';
import { ConditioningRecordService } from '../conditioning-records.service';
import { ConditioningSession } from '../../models/ConditioningSession';
import { format } from 'date-fns';

@Component({
	selector: 'app-edit-record',
	standalone: false,
	templateUrl: './edit-record.component.html',
})
export class EditRecordComponent {
	@Input() selectedRecord?: ConditioningRecord | null = null;

	formLoading = false;
	sessionsLoading = false;

	@Output() closeEditModeEvent = new EventEmitter<void>();

	private _conditioningSessions: Array<ConditioningSession> = [];

	selectedSessionTemplate?: ConditioningSession;
	recordForm!: FormGroup | null; // allow null until ready

	constructor(
		private fb: FormBuilder,
		public conditioningRecordService: ConditioningRecordService,
		public conditioningLibraryService: ConditioningLibraryService,
	) {}

	get allConditioningSessions(): Array<ConditioningSession> {
		return this._conditioningSessions;
	}

	ngOnInit(): void {
		this.getAllSessions();
	}

	/** Build the form once we know the session */
	private buildForm(session: ConditioningSession) {
		const recordToEdit = this.selectedRecord ?? new ConditioningRecord(null);
		this.recordForm = ConditioningRecord.createFormGroup(this.fb, recordToEdit, session);
	}

	getAllSessions() {
		this.sessionsLoading = true;
		this.conditioningLibraryService.getAllConditioningSessions().subscribe(allSessions => {
			this._conditioningSessions = allSessions;
			this.sessionsLoading = false;

			// If editing an existing record, build the form now that sessions are available
			if (this.selectedRecord?.sessionId) {
				const session = this.getSessionById(this.selectedRecord.sessionId);
				if (session) {
					this.buildForm(session);
				}
			}
		});
	}

    formatDate(date: string): string {
        if (!date) return '';
        const parsedDate = typeof date === 'string' ? new Date(date) : date;
        return format(parsedDate, 'MMMM dd, yyyy');
    }

	getSessionById(sessionId: string | null | undefined): ConditioningSession | null {
		if (!sessionId) return null;
		const session = this.allConditioningSessions.find(s => s._id === sessionId);
		return session || null;
	}

	/** When creating a new record, selecting a session should build the form */
	selectSession(conditioningSession: ConditioningSession) {
		this.selectedSessionTemplate = conditioningSession;
		this.buildForm(conditioningSession);
	}

	isInvalid(controlName: string): boolean {
		if (!this.recordForm) return false;
		const control = this.recordForm.get(controlName);
		return !!(control && control.touched && control.invalid);
	}

	onSubmit(): void {
		if (!this.recordForm) return;
		this.formLoading = true;

		if (this.selectedRecord) {
			this.conditioningRecordService
				.updateConditioningRecord(this.selectedRecord._id, this.recordForm.value)
				.subscribe(() => {
					this.closeEditModeEvent.emit();
					this.formLoading = false;
				});
		} else {
			this.conditioningRecordService.createConditioningRecord(this.recordForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}

	onCancel(): void {
		this.closeEditModeEvent.emit();
	}
}
