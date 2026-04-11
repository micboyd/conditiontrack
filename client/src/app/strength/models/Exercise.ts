import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class Exercise {
	_id: string = '';
	userId: string;
	name: string;
	description: string;

	constructor(exercise: Exercise | null) {
		this._id = exercise?._id || '';
		this.userId = exercise?.userId || '';
		this.name = exercise?.name || '';
		this.description = exercise?.description || '';
	}

	static toFormGroup(exercise: Exercise, fb: FormBuilder): FormGroup {
		return fb.group({
			userId: [localStorage.getItem('id')],
			name: [exercise.name, [Validators.required]],
			description: [exercise.description, [Validators.required]],
		});
	}
}

