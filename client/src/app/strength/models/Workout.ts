import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from './Exercise';

export class Workout {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public exercises: Exercise[]
    ) {}

    static toFormGroup(workout: Workout, fb: FormBuilder): FormGroup {
        return fb.group({
            id: [workout.id],
            name: [workout.name],
            description: [workout.description],
            exercises: fb.array(
                workout.exercises.map(ex => Exercise.toFormGroup(ex, fb))
            )
        });
    }
}
