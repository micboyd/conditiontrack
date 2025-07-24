import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
	getWorkoutById(id: string) {
		return of({
			id: '1',
			name: 'Leg Day',
			description: 'Leg-focused workout',
			exercises: [
				{
					id: 'e1',
					name: 'Squats',
					description: 'Barbell back squats',
					sets: [
						{ id: 's1', exerciseId: 'e1', reps: 10, weight: 100 },
						{ id: 's2', exerciseId: 'e1', reps: 8, weight: 110 },
					],
				},
				{
					id: 'e2',
					name: 'Lunges',
					description: 'Dumbbell lunges',
					sets: [{ id: 's3', exerciseId: 'e2', reps: 12, weight: 40 }],
				},
			],
		});
	}
}
