import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConditioningLibraryService } from '../conditioning-library.service';
import { ConditioningSession } from '../../models/ConditioningSession';

ConditioningSession;

@Component({
	selector: 'app-edit-session',
	templateUrl: './edit-session.component.html',
	standalone: false,
})
export class EditSessionComponent implements OnInit {
	sessionForm!: FormGroup;
	formLoading = false;
	selectedCategories: string[] = [];

	@Input() selectedSession: ConditioningSession | null = null;

	@Output() closeEditModeEvent = new EventEmitter<void>();

	constructor(private fb: FormBuilder, public conditioningLibraryService: ConditioningLibraryService) {}

	ngOnInit(): void {
		const sessionToEdit = this.selectedSession ?? new ConditioningSession(null);
		this.sessionForm = ConditioningSession.createFormGroup(this.fb, sessionToEdit);

		this.selectedCategories = sessionToEdit.category ? [sessionToEdit.category] : [];
	}
	isInvalid(controlName: string): boolean {
		const control = this.sessionForm.get(controlName);
		return !!(control && control.invalid && (control.touched || control.dirty));
	}

	updateCategory(selected: string[]): void {
		this.selectedCategories = selected;
		this.sessionForm.patchValue({ category: selected[0] || '' });
	}

	onSubmit(): void {
		this.formLoading = true;
		if (this.selectedSession) {
			this.conditioningLibraryService
				.updateConditioningSession(this.selectedSession._id, this.sessionForm.value)
				.subscribe(() => {
					this.closeEditModeEvent.emit();
					this.formLoading = false;
				});
		} else {
			this.conditioningLibraryService.createConditioningSession(this.sessionForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}
}
