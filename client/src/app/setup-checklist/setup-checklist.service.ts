import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChecklistItem {
	id: string;
	category: 'strength' | 'cardio' | 'nutrition' | 'progress' | 'profile';
	categoryLabel: string;
	title: string;
	description: string;
	route: string;
	ctaLabel: string;
	icon: string;
	completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class SetupChecklistService {
	private base = environment.baseApiUrl;

	constructor(private http: HttpClient) {}

	getStatus(): Observable<ChecklistItem[]> {
		const userId = localStorage.getItem('id') ?? '';
		const safe = <T>(obs: Observable<T[]>) => obs.pipe(catchError(() => of([] as T[])));

		return forkJoin({
			workouts: safe(this.http.get<any[]>(`${this.base}/strength/workout/${userId}`)),
			workoutRecords: safe(this.http.get<any[]>(`${this.base}/strength/workout-record/${userId}`)),
			cardioSessions: safe(this.http.get<any[]>(`${this.base}/conditioning/conditioning-session/${userId}`)),
			cardioRecords: safe(this.http.get<any[]>(`${this.base}/conditioning/conditioning-record/${userId}`)),
			meals: safe(this.http.get<any[]>(`${this.base}/nutrition/meal/${userId}`)),
			measurements: safe(this.http.get<any[]>(`${this.base}/progress/measurements/${userId}`)),
			goals: safe(this.http.get<any[]>(`${this.base}/goals/goal/${userId}`)),
			user: this.http.get<any>(`${this.base}/user/${userId}`).pipe(catchError(() => of(null))),
		}).pipe(
			map(data => [
				{
					id: 'workout_library',
					category: 'strength' as const,
					categoryLabel: 'Strength',
					title: 'Add a workout to your library',
					description: 'Create a workout template with exercises you can log sessions against.',
					route: '/strength/workout-library',
					ctaLabel: 'Go to Workout Library',
					icon: 'fa-dumbbell',
					completed: data.workouts.length > 0,
				},
				{
					id: 'workout_record',
					category: 'strength' as const,
					categoryLabel: 'Strength',
					title: 'Log your first strength session',
					description: 'Record a completed workout to start building your strength history.',
					route: '/strength/workout-records',
					ctaLabel: 'Log a Session',
					icon: 'fa-clipboard-check',
					completed: data.workoutRecords.length > 0,
				},
				{
					id: 'cardio_library',
					category: 'cardio' as const,
					categoryLabel: 'Cardio',
					title: 'Add a cardio session template',
					description: 'Define the types of cardio you do — runs, cycles, swims, and more.',
					route: '/conditioning/conditioning-library',
					ctaLabel: 'Go to Cardio Library',
					icon: 'fa-person-running',
					completed: data.cardioSessions.length > 0,
				},
				{
					id: 'cardio_record',
					category: 'cardio' as const,
					categoryLabel: 'Cardio',
					title: 'Log your first cardio session',
					description: 'Record a completed cardio session to start tracking your endurance.',
					route: '/conditioning/conditioning-records',
					ctaLabel: 'Log a Session',
					icon: 'fa-stopwatch',
					completed: data.cardioRecords.length > 0,
				},
				{
					id: 'meal_library',
					category: 'nutrition' as const,
					categoryLabel: 'Nutrition',
					title: 'Add a meal to your library',
					description: 'Build a library of meals with calorie and macro information.',
					route: '/nutrition/meal-library',
					ctaLabel: 'Go to Meal Library',
					icon: 'fa-utensils',
					completed: data.meals.length > 0,
				},
				{
					id: 'measurement',
					category: 'progress' as const,
					categoryLabel: 'Progress',
					title: 'Log a body measurement',
					description: 'Record your weight, body fat %, or muscle mass to track your body composition over time.',
					route: '/progress/measurements',
					ctaLabel: 'Log a Measurement',
					icon: 'fa-weight-scale',
					completed: data.measurements.length > 0,
				},
				{
					id: 'goal',
					category: 'progress' as const,
					categoryLabel: 'Progress',
					title: 'Set your first goal',
					description: 'Define what you are working towards to stay motivated and focused.',
					route: '/goals',
					ctaLabel: 'Set a Goal',
					icon: 'fa-bullseye',
					completed: data.goals.length > 0,
				},
				{
					id: 'profile',
					category: 'profile' as const,
					categoryLabel: 'Profile',
					title: 'Complete your profile',
					description: 'Add a profile photo and bio to personalise your ConditionTrack experience.',
					route: '/profile',
					ctaLabel: 'Edit Profile',
					icon: 'fa-user',
					completed: !!(data.user?.profileImage || data.user?.bio),
				},
			])
		);
	}
}
