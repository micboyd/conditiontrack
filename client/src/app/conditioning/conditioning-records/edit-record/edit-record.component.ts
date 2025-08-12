import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConditioningLibraryService } from '../../conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../../models/ConditioningRecord';
import { ConditioningRecordService } from '../conditioning-records.service';
import { ConditioningSession } from '../../models/ConditioningSession';

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
	recordForm!: FormGroup;

	constructor(
        private fb: FormBuilder,
        public conditioningRecordService: ConditioningRecordService,
        public conditioningLibraryService: ConditioningLibraryService
    ) {}

    get allConditioningSessions(): Array<ConditioningSession> {
        return this._conditioningSessions;
    }

	ngOnInit(): void {
        this.getAllSessions();
        this.initForm();
    }

    initForm() {
        const recordToEdit = this.selectedRecord ?? new ConditioningRecord(null);
        const session = this.getSessionById(recordToEdit.sessionId)
        if (session) {
                this.recordForm = ConditioningRecord.createFormGroup(this.fb, recordToEdit, session);
        }
    }

    getAllSessions() {
        this.sessionsLoading = true;
        this.conditioningLibraryService.getAllConditioningSessions().subscribe(allSessions => {
            this._conditioningSessions = allSessions;
            this.sessionsLoading = false;
        })
    }

    getSessionById(sessionId: string): ConditioningSession | null {
        const session = this.allConditioningSessions.find((session) => session._id === sessionId);
        return session || null;
    }

    selectSession(conditioningSession: ConditioningSession) {
        this.selectedSessionTemplate = conditioningSession;
    }

	isInvalid(controlName: string): boolean {
		const control = this.recordForm.get(controlName);
		return !!(control && control.touched && control.invalid);
	}

	onSubmit(): void {
        this.formLoading = true;
		if (this.selectedRecord) {
			this.conditioningRecordService
				.updateConditioningRecord(this.selectedRecord._id, this.recordForm.value)
				.subscribe(() => {
					this.closeEditModeEvent.emit();
					this.formLoading = false;
				});
		} else {
			this.conditioningRecordService
				.createConditioningRecord(this.recordForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}


	onCancel(): void {
		this.closeEditModeEvent.emit();
	}
}
