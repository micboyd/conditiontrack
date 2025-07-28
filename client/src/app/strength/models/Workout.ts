import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from './Exercise';

export class Workout {
    _id: string;
    userId: string;
    name: string;
    description: string;
    exercises: string[];

    constructor(workout: Workout | null) {
        this._id = workout?._id || '';
        this.userId = workout?.userId || '';
        this.name = workout?.name || '';
        this.description = workout?.description || '';
        this.exercises = workout?.exercises || [];
    }

    static toFormGroup(workout: Workout, fb: FormBuilder): FormGroup {
        return fb.group({
            userId: [localStorage.getItem('id')],
            name: [workout.name],
            description: [workout.description]
        });
    }
}
