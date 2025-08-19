import { ConditioningRecordsComponent } from "../../conditioning/conditioning-records/conditioning-records.component";
import { ConditioningSession } from "../../conditioning/models/ConditioningSession";
import { Workout } from "../../strength/models/Workout";

export class DayPlan {
    name: '';
    conditioningSessions: ConditioningSession[] = [];
    strengthSessions: Workout[] = [];
}
