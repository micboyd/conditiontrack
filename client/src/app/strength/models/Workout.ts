import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Exercise } from './Exercise';

export class Workout {
	_id: string;
	userId: string;
	name: string;
	description: string;
	exercises: Exercise[];

	constructor(workout: Workout | null) {
		this._id = workout?._id || '';
		this.userId = workout?.userId || '';
		this.name = workout?.name || '';
		this.description = workout?.description || '';
		this.exercises = workout?.exercises || [];
	}

	static toFormGroup(workout: Workout, fb: FormBuilder): FormGroup {
		return fb.group({
			userId: [localStorage.getItem('id'), [Validators.required]],
			name: [workout.name, [Validators.required]],
			description: [workout.description, [Validators.required]],
		});
	}
}

