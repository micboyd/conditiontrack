import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface WorkoutExerciseTemplate {
	_id: string;
	name: string;
	defaultSets: number;
	defaultReps: number;
}

export class Workout {
	_id: string;
	userId: string;
	name: string;
	description: string;
	exercises: WorkoutExerciseTemplate[];

	constructor(workout: Workout | null) {
		this._id = workout?._id || '';
		this.userId = workout?.userId || '';
		this.name = workout?.name || '';
		this.description = workout?.description || '';
		this.exercises = (workout?.exercises || []).map(e => ({
			_id: e._id,
			name: e.name,
			defaultSets: e.defaultSets ?? 3,
			defaultReps: e.defaultReps ?? 10,
		}));
	}

	static toFormGroup(workout: Workout, fb: FormBuilder): FormGroup {
		return fb.group({
			userId: [localStorage.getItem('id'), [Validators.required]],
			name: [workout.name, [Validators.required]],
			description: [workout.description, [Validators.required]],
		});
	}
}

