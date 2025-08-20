import { FormGroup } from "@angular/forms";

export class WorkoutSet {
    reps: number; // required
    weight: number; // required

    constructor(set?: Partial<WorkoutSet>) {
        this.reps = set?.reps ?? 0; // default to 0 if not provided
        this.weight = set?.weight ?? 0; // default to 0 if not provided
    }
}
