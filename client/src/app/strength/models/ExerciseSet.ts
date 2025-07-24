import { FormBuilder, FormGroup } from '@angular/forms';

export class ExerciseSet {
    constructor(
        public id: string,
        public exerciseId: string,
        public reps: number,
        public weight: number,
    ) {}

    static toFormGroup(set: ExerciseSet, fb: FormBuilder): FormGroup {
        return fb.group({
            id: [set.id],
            exerciseId: [set.exerciseId],
            reps: [set.reps],
            weight: [set.weight],
        });
    }
}
