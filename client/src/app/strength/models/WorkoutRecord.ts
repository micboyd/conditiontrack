import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Workout } from './Workout';

export class WorkoutRecord {
	_id: string;
	notes: string;
	duration: number; // required
	userId: string;
	workoutId: string;
	date: string;
	exercises: {
		name: string;
		sets: { reps: number; weight: number }[]; // weight is required
	}[];

	constructor(workout?: Partial<WorkoutRecord>) {
		this._id = workout?._id || '';
		this.notes = workout?.notes || '';
		this.duration = workout?.duration ?? 0; // required but default to 0
		this.userId = workout?.userId || localStorage.getItem('id') || '';
		this.workoutId = workout?.workoutId || '';
		this.date = workout?.date || new Date().toISOString().split('T')[0];

		// Correctly map exercises from passed workout
		this.exercises = (workout?.exercises || []).map(ex => ({
			name: ex.name,
			sets: (ex.sets || []).map(set => ({
				reps: set.reps,
				weight: set.weight,
			})),
		}));
	}

	// ----- Form Builders -----

	static createSetFormGroup(fb: FormBuilder) {
		return fb.group({
			reps: ['', [Validators.required]], // now required
			weight: ['', [Validators.required]], // now required
		});
	}

	static createExerciseFormGroup(exerciseName: string, fb: FormBuilder) {
		return fb.group({
			name: [exerciseName, [Validators.required]], // exercise name required
			sets: fb.array([]), // still empty until sets are added
		});
	}

	static toFormGroup(record: WorkoutRecord, fb: FormBuilder): FormGroup {
		return fb.group({
			_id: [record._id],
			notes: [record.notes, [Validators.required]],
			duration: [record.duration, [Validators.required]],
			userId: [record.userId, [Validators.required]],
			workoutId: [record.workoutId, [Validators.required]],
			date: [record.date, [Validators.required]],
			exercises: fb.array(
				record.exercises.map(e => this.createExerciseFormGroup(e.name, fb))
			),
		});
	}

	static fromWorkoutTemplate(workout: Workout): WorkoutRecord {
		const record = new WorkoutRecord();
		record.workoutId = workout._id;
		record.exercises = workout.exercises.map(exName => ({
			name: exName.name,
			sets: [],
		}));
		return record;
	}

	static getExercises(form: FormGroup): FormArray {
		return form.get('exercises') as FormArray;
	}

	static getSets(exercisesArray: FormArray, exerciseIndex: number): FormArray {
		return exercisesArray.at(exerciseIndex).get('sets') as FormArray;
	}

	static addSet(exercisesArray: FormArray, exerciseIndex: number, fb: FormBuilder) {
		this.getSets(exercisesArray, exerciseIndex).push(this.createSetFormGroup(fb));
	}

	static removeSet(exercisesArray: FormArray, exerciseIndex: number, setIndex: number) {
		this.getSets(exercisesArray, exerciseIndex).removeAt(setIndex);
	}
}
