import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConditioningLibraryService } from '../../conditioning-library/conditioning-library.service';
import { ConditioningRecord } from '../../models/ConditioningRecord';
import { ConditioningSession } from '../../models/ConditioningSession';

@Component({
  selector: 'app-edit-record',
  standalone: false,
  templateUrl: './edit-record.component.html',
})
export class EditRecordComponent {
	@Input() selectedRecord?: ConditioningRecord;
	@Input() formLoading = false;

	@Output() cancel = new EventEmitter<void>();

    private _conditioningSessions: Array<ConditioningSession> = [];

    selectedSessionTemplate?: ConditioningSession;
	recordForm!: FormGroup;

	constructor(private fb: FormBuilder, public conditioningLibraryService: ConditioningLibraryService) {}

    get allConditioningSessions(): Array<ConditioningSession> {
        return this._conditioningSessions;
    }

	ngOnInit(): void {
        this.getAllSessions();
    }

    getAllSessions() {
        this.conditioningLibraryService.getAllConditioningSessions().subscribe(allSessions => {
            this._conditioningSessions = allSessions;
        })
    }

    selectSession(conditioningSession: ConditioningSession) {
        this.selectedSessionTemplate = conditioningSession;
        const recordToEdit = this.selectedRecord ?? new ConditioningRecord(null);
        this.recordForm = ConditioningRecord.createFormGroup(this.fb, recordToEdit, this.selectedSessionTemplate);
    }

	isInvalid(controlName: string): boolean {
		const control = this.recordForm.get(controlName);
		return !!(control && control.touched && control.invalid);
	}

	onSubmit(): void {
		if (this.recordForm.valid) {
			console.log(this.recordForm.value);
		} else {
			this.recordForm.markAllAsTouched();
		}
	}

	onCancel(): void {
		this.cancel.emit();
	}
}
