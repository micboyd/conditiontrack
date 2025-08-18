import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { Workout } from '../../strength/models/Workout';

export class Day = {
    name: string;
    conditioning?: ConditioningSession[];
    strength?: Workout[];
}

export class Week {
    day: Day[];

    constructor(day: Day[]) {
        this.day = day;
    }
}
