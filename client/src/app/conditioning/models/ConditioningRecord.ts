import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConditioningSession } from './ConditioningSession';

export class ConditioningRecord {
	_id: string;
	userId: string;
	sessionId: string;
	date: string;
	duration: number;
	notes: string;
	completed: boolean;
    caloriesBurned: number;

	constructor(record?: Partial<ConditioningRecord> | null) {
		this._id = record?._id || '';
		this.userId = record?.userId || '';
		this.sessionId = record?.sessionId || '';
		this.date = record?.date || '';
		this.duration = record?.duration ?? 0;
		this.notes = record?.notes || '';
		this.completed = record?.completed ?? false;
        this.caloriesBurned = record?.caloriesBurned ?? 0;
	}

	static createFormGroup(
		fb: FormBuilder,
		record?: ConditioningRecord,
		session?: ConditioningSession
	): FormGroup {
		return fb.group({
			sessionId: [record?.sessionId || session?._id || '', Validators.required],
			date: [record?.date || new Date(), Validators.required],
			duration: [
				record?.duration ?? session?.duration ?? 0,
				[Validators.required, Validators.min(1)]
			],
			notes: [record?.notes || ''],
			completed: [record?.completed ?? false],
            caloriesBurned: [record?.caloriesBurned ?? 0],
			userId: [record?.userId || localStorage.getItem('id')],
		});
	}
}
