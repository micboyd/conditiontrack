import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainingBlock } from '../models/TrainingBlock';
import { TrainingBlocksService } from '../training-blocks.service';

@Component({
	selector: 'app-edit-training-block',
	templateUrl: './edit-training-block.component.html',
	standalone: false,
})
export class EditTrainingBlockComponent implements OnChanges {
	@Input() selectedBlock: TrainingBlock | null = null;
	@Input() allBlocks: TrainingBlock[] = [];

	@Output() saved = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	blockForm: FormGroup;
	overlapError: string | null = null;
	saving = false;

	constructor(
		private fb: FormBuilder,
		private trainingBlocksService: TrainingBlocksService,
	) {
		this.blockForm = TrainingBlock.toFormGroup(null, this.fb);
	}

	ngOnChanges(): void {
		this.blockForm = TrainingBlock.toFormGroup(this.selectedBlock, this.fb);
		this.overlapError = null;
	}

	get startDate(): string { return this.blockForm.get('startDate')?.value ?? ''; }
	get endDate(): string | null { return this.blockForm.get('endDate')?.value ?? null; }

	onStartDateChange(value: string): void {
		this.blockForm.get('startDate')?.setValue(value);
		this.blockForm.get('startDate')?.markAsTouched();
		this.validateOverlap();
	}

	onEndDateChange(value: string): void {
		this.blockForm.get('endDate')?.setValue(value);
		this.validateOverlap();
	}

	clearEndDate(): void {
		this.blockForm.get('endDate')?.setValue(null);
		this.validateOverlap();
	}

	private validateOverlap(): void {
		const start = this.blockForm.get('startDate')?.value;
		const end   = this.blockForm.get('endDate')?.value ?? null;
		if (!start) { this.overlapError = null; return; }
		const conflict = TrainingBlock.checkOverlap(start, end, this.allBlocks, this.selectedBlock?._id);
		this.overlapError = conflict ? `Overlaps with "${conflict.name}" (${conflict.dateRangeLabel})` : null;
	}

	onSubmit(): void {
		if (this.blockForm.invalid || this.overlapError) return;
		this.saving = true;
		const value = this.blockForm.value;
		const payload: Partial<TrainingBlock> = {
			userId:    localStorage.getItem('id') ?? '',
			name:      value.name,
			startDate: value.startDate,
			endDate:   value.endDate || null,
			notes:     value.notes,
		};

		const request = this.selectedBlock?._id
			? this.trainingBlocksService.updateBlock(this.selectedBlock._id, payload)
			: this.trainingBlocksService.createBlock(payload);

		request.subscribe({
			next: () => { this.saving = false; this.saved.emit(); },
			error: (err) => {
				this.saving = false;
				this.overlapError = err.error?.message ?? 'Failed to save';
			},
		});
	}

	onCancel(): void {
		this.cancelled.emit();
	}

	otherBlocks(): TrainingBlock[] {
		return this.allBlocks.filter(b => b._id !== this.selectedBlock?._id);
	}

	/** Disabled ranges for both date pickers — all other blocks */
	get blockDisabledRanges(): { start: string; end: string | null }[] {
		return this.otherBlocks().map(b => ({ start: b.startDate, end: b.endDate }));
	}
}
