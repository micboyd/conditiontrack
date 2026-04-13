import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ConditioningLibraryService } from '../conditioning-library.service';
import { ConditioningSession, SessionPart } from '../../models/ConditioningSession';

@Component({
	selector: 'app-edit-session',
	templateUrl: './edit-session.component.html',
	standalone: false,
})
export class EditSessionComponent implements OnInit, OnChanges {
	sessionForm!: FormGroup;
	formLoading = false;
	selectedCategories: string[] = [];
	parts: SessionPart[] = [];

	@Input() selectedSession: ConditioningSession | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	constructor(private fb: FormBuilder, public conditioningLibraryService: ConditioningLibraryService) {}

	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedSession']) {
			this.initForm();
		}
	}

	private initForm(): void {
		const s = this.selectedSession ?? new ConditioningSession(null);
		this.sessionForm = ConditioningSession.createFormGroup(this.fb, s);
		this.selectedCategories = s.category ? [s.category] : [];
		this.parts = s.parts.map(p => ({ ...p }));
	}

	isInvalid(controlName: string): boolean {
		const control = this.sessionForm.get(controlName);
		return !!(control && control.invalid && (control.touched || control.dirty));
	}

	updateCategory(selected: string[]): void {
		this.selectedCategories = selected;
		this.sessionForm.patchValue({ category: selected[0] || '' });
	}

	addPart(): void {
		this.parts.push({ part: '', work: '' });
	}

	removePart(index: number): void {
		this.parts.splice(index, 1);
	}

	updatePart(index: number, field: 'part' | 'work', value: string): void {
		this.parts[index][field] = value;
	}

	onSubmit(): void {
		this.sessionForm.markAllAsTouched();
		if (this.sessionForm.invalid) return;

		this.formLoading = true;
		const payload = { ...this.sessionForm.value, parts: this.parts };

		if (this.selectedSession) {
			this.conditioningLibraryService
				.updateConditioningSession(this.selectedSession._id, payload)
				.subscribe(() => {
					this.closeEditModeEvent.emit();
					this.formLoading = false;
				});
		} else {
			this.conditioningLibraryService.createConditioningSession(payload).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}
}
