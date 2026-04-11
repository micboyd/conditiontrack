import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Goal, GoalMetric, GoalPeriod } from './models/Goal';

@Injectable()
export class GoalsService {
	private base = `${environment.baseApiUrl}/goals/goal`;

	constructor(private http: HttpClient) {}

	// ── CRUD ──────────────────────────────────────────────────────────────────

	getAllGoals(): Observable<Goal[]> {
		const userId = localStorage.getItem('id');
		return this.http.get<Goal[]>(`${this.base}/${userId}`);
	}

	createGoal(goal: Partial<Goal>): Observable<Goal> {
		return this.http.post<Goal>(this.base, goal);
	}

	updateGoal(id: string, goal: Partial<Goal>): Observable<Goal> {
		return this.http.put<Goal>(`${this.base}/${id}`, goal);
	}

	deleteGoal(id: string): Observable<void> {
		return this.http.delete<void>(`${this.base}/${id}`);
	}

	markComplete(id: string): Observable<Goal> {
		return this.http.put<Goal>(`${this.base}/${id}`, { status: 'completed' });
	}

	// ── Auto-compute helpers ──────────────────────────────────────────────────

	private getWorkoutRecords(): Observable<any[]> {
		const userId = localStorage.getItem('id');
		return this.http.get<any[]>(`${environment.baseApiUrl}/strength/workout-record/${userId}`);
	}

	private getConditioningRecords(): Observable<any[]> {
		const userId = localStorage.getItem('id');
		return this.http.get<any[]>(`${environment.baseApiUrl}/conditioning/conditioning-record/${userId}`);
	}

	private getProgressPhotos(): Observable<any[]> {
		const userId = localStorage.getItem('id');
		return this.http.get<any[]>(`${environment.baseApiUrl}/progress/photos/${userId}`);
	}

	private getDailyLogs(): Observable<any[]> {
		const userId = localStorage.getItem('id');
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		return this.http.get<any[]>(
			`${environment.baseApiUrl}/nutrition/daily-log/${userId}/month/${year}/${month}`
		);
	}

	// Resolve currentValue for all auto goals in a single batched pass.
	// Returns a Map of goalId → computed currentValue.
	resolveAutoValues(goals: Goal[]): Observable<Map<string, number>> {
		const autoGoals = goals.filter(g => g.trackingType === 'auto');
		if (autoGoals.length === 0) return of(new Map());

		const needsWorkouts  = autoGoals.some(g => g.metric === 'workout_count' || g.metric === 'exercise_weight');
		const needsCardio    = autoGoals.some(g => g.metric === 'cardio_sessions' || g.metric === 'cardio_minutes');
		const needsNutrition = autoGoals.some(g => g.metric === 'nutrition_days');
		const needsPhotos    = autoGoals.some(g => g.metric === 'body_weight');

		return forkJoin({
			workouts:  needsWorkouts  ? this.getWorkoutRecords()     : of([] as any[]),
			cardio:    needsCardio    ? this.getConditioningRecords() : of([] as any[]),
			nutrition: needsNutrition ? this.getDailyLogs()          : of([] as any[]),
			photos:    needsPhotos    ? this.getProgressPhotos()      : of([] as any[]),
		}).pipe(
			map(data => {
				const now = new Date();
				const result = new Map<string, number>();

				for (const goal of autoGoals) {
					const windowStart = this.windowStart(goal.period, now);
					let value = 0;

					switch (goal.metric as GoalMetric) {
						case 'workout_count':
							value = data.workouts.filter((r: any) => new Date(r.date) >= windowStart).length;
							break;

						case 'cardio_sessions':
							value = data.cardio.filter((r: any) => new Date(r.date) >= windowStart).length;
							break;

						case 'cardio_minutes':
							value = data.cardio
								.filter((r: any) => new Date(r.date) >= windowStart)
								.reduce((sum: number, r: any) => sum + (r.duration ?? 0), 0);
							break;

						case 'nutrition_days':
							value = new Set(
								data.nutrition
									.filter((l: any) => new Date(l.date) >= windowStart)
									.map((l: any) => l.date)
							).size;
							break;

						case 'exercise_weight':
							if (goal.exerciseName) {
								data.workouts.forEach((r: any) =>
									(r.exercises ?? [])
										.filter((e: any) => e.name?.toLowerCase() === goal.exerciseName!.toLowerCase())
										.forEach((e: any) =>
											(e.sets ?? []).forEach((s: any) => { if (s.weight > value) value = s.weight; })
										)
								);
							}
							break;

						case 'body_weight': {
							const sorted = data.photos
								.filter((p: any) => p.weight != null)
								.sort((a: any, b: any) => b.date.localeCompare(a.date));
							value = sorted.length > 0 ? (sorted[0].weight ?? 0) : 0;
							break;
						}
					}

					result.set(goal._id, value);
				}

				return result;
			})
		);
	}

	private windowStart(period: GoalPeriod | null, now: Date): Date {
		if (period === 'week') {
			const d = new Date(now);
			d.setDate(d.getDate() - 6);
			d.setHours(0, 0, 0, 0);
			return d;
		}
		if (period === 'month') {
			const d = new Date(now);
			d.setDate(d.getDate() - 29);
			d.setHours(0, 0, 0, 0);
			return d;
		}
		return new Date(0); // 'total' — all-time
	}
}
