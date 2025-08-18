// week-planner.component.ts

import { Component } from '@angular/core';
import { ConditioningSession } from '../conditioning/models/ConditioningSession';
import { Week, Day } from './models/WeekPlan';
import { Workout } from '../strength/models/Workout';

@Component({
	selector: 'app-week-planner',
	templateUrl: './week-planner.component.html',
	standalone: false,
})
export class WeekPlannerComponent {
	seededWeek: Week = [

        new Day()

		{
			day: {
				name: 'Monday',
				conditioning: [
					new ConditioningSession({
						_id: 'c1',
						userId: 'u1',
						name: 'HIIT Intervals',
						description: '10 rounds of 1 min sprint / 1 min walk',
						duration: 20,
						category: 'Cardio',
					}),
				],
				strength: [
					new Workout({
						_id: 'w1',
						userId: 'u1',
						name: 'Push Day',
						description: 'Chest, shoulders, triceps',
						exercises: [],
					}),
				],
			},
		},
	];
}
