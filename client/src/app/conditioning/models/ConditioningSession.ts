import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ConditioningSession {
	_id: string;
	userId: string;
	name: string;
	description: string;
	duration: number;
	category: string;

	constructor(session?: Partial<ConditioningSession> | null) {
		this._id = session?._id || '';
		this.userId = session?.userId || '';
		this.name = session?.name || '';
		this.description = session?.description || '';
		this.duration = session?.duration ?? 0;
		this.category = session?.category || '';
	}

	static createFormGroup(fb: FormBuilder, session?: ConditioningSession): FormGroup {
		return fb.group({
			name: [session?.name || '', [Validators.required, Validators.minLength(3)]],
			description: [session?.description || ''],
			duration: [session?.duration ?? 0, [Validators.required, Validators.min(1)]],
			category: [session?.category || '', Validators.required],
			userId: [session?.userId || localStorage.getItem('id')]
		});
	}
}
