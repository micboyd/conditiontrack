import { FormBuilder, FormGroup } from '@angular/forms';

import { ExerciseSet } from './ExerciseSet';

export class Exercise {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public sets: ExerciseSet[]
    ) {}

    static toFormGroup(exercise: Exercise, fb: FormBuilder): FormGroup {
        return fb.group({
            id: [exercise.id],
            name: [exercise.name],
            description: [exercise.description],
            sets: fb.array(
                exercise.sets.map(set => ExerciseSet.toFormGroup(set, fb))
            )
        });
    }
}
