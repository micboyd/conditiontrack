import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface SessionPart {
	part: string;
	work: string;
}

export class ConditioningSession {
	_id: string;
	userId: string;
	name: string;
	duration: number;
	category: string;
	purpose: string;
	howToUse: string;
	parts: SessionPart[];

	constructor(session?: Partial<ConditioningSession> | null) {
		this._id      = session?._id      || '';
		this.userId   = session?.userId   || '';
		this.name     = session?.name     || '';
		this.duration = session?.duration ?? 0;
		this.category = session?.category || '';
		this.purpose  = session?.purpose  || '';
		this.howToUse = session?.howToUse || '';
		this.parts    = session?.parts    ?? [];
	}

	static createFormGroup(fb: FormBuilder, session?: ConditioningSession): FormGroup {
		return fb.group({
			name:     [session?.name     || '', [Validators.required, Validators.minLength(3)]],
			duration: [session?.duration ?? 0,  [Validators.required, Validators.min(1)]],
			category: [session?.category || '',  Validators.required],
			userId:   [session?.userId   || localStorage.getItem('id')],
			purpose:  [session?.purpose  || ''],
			howToUse: [session?.howToUse || ''],
		});
	}
}
