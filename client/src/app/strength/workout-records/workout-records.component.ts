import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import {
	Chart, LineController, LineElement, PointElement,
	LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';
import { format, parseISO } from 'date-fns';

import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { Workout } from '../models/Workout';
import { WorkoutRecord } from '../models/WorkoutRecord';
import { WorkoutRecordService } from './workout-records.service';
import { WorkoutService } from '../workout-library/workout.service';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

@Component({
	selector: 'app-workout-records',
	templateUrl: './workout-records.component.html',
	standalone: false,
})
export class WorkoutRecordsComponent implements OnInit, AfterViewChecked, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer!: SideDrawerComponent;
	@ViewChild('strengthCanvas') canvasRef: ElementRef<HTMLCanvasElement>;

	workoutsLoading = false;
	workoutRecordsLoading = false;

	private _allWorkoutRecords: WorkoutRecord[] = [];
	private _allWorkouts: Workout[] = [];

	selectedWorkoutRecord: WorkoutRecord | null = null;
	drawerOpen = false;

	// Chart state
	selectedExercise: string = '';
	private chart: Chart | null = null;
	private chartNeedsInit = false;

	constructor(public workoutRecordService: WorkoutRecordService, public workoutService: WorkoutService) {}

	ngOnInit(): void {
		this.getAllWorkoutRecords();
		this.getAllWorkouts();
	}

	ngAfterViewChecked(): void {
		if (this.chartNeedsInit && this.canvasRef) {
			this.chartNeedsInit = false;
			this.initChart();
		}
	}

	ngOnDestroy(): void {
		this.destroyChart();
	}

	get allWorkouts(): Workout[] {
		return this._allWorkouts;
	}

	get allWorkoutRecords(): WorkoutRecord[] {
		return this._allWorkoutRecords;
	}

	get loading(): boolean {
		return this.workoutRecordsLoading || this.workoutsLoading;
	}

	get showChart(): boolean {
		return this.uniqueExercises.length > 0;
	}

	get uniqueExercises(): string[] {
		const names = this._allWorkoutRecords.flatMap(r => r.exercises.map((e: any) => e.name as string));
		return [...new Set(names)].sort();
	}

	getProgressData(exerciseName: string): { date: string; maxWeight: number }[] {
		return this._allWorkoutRecords
			.filter(r => r.exercises.some((e: any) => e.name === exerciseName))
			.map(r => {
				const ex = r.exercises.find((e: any) => e.name === exerciseName)!;
				const maxWeight = Math.max(...(ex as any).sets.map((s: any) => s.weight ?? 0));
				return { date: r.date as string, maxWeight };
			})
			.filter(d => isFinite(d.maxWeight))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	onExerciseChange(name: string): void {
		this.selectedExercise = name;
		this.updateChart();
	}

	private initChart(): void {
		if (!this.canvasRef) return;
		this.destroyChart();
		const data = this.getProgressData(this.selectedExercise);
		const labels = data.map(d => {
			try { return format(parseISO(d.date), 'd MMM yy'); } catch { return d.date; }
		});

		this.chart = new Chart(this.canvasRef.nativeElement, {
			type: 'line',
			data: {
				labels,
				datasets: [{
					label: 'Max Weight (kg)',
					data: data.map(d => d.maxWeight),
					borderColor: '#18181b',
					backgroundColor: 'transparent',
					tension: 0.3,
					pointRadius: 4,
					borderWidth: 2,
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => `Max: ${ctx.parsed.y} kg`,
						},
					},
				},
				scales: {
					x: {
						ticks: { font: { size: 11 }, color: '#a1a1aa' },
						grid: { color: '#f4f4f5' },
					},
					y: {
						ticks: { font: { size: 11 }, color: '#a1a1aa' },
						grid: { color: '#f4f4f5' },
						title: { display: true, text: 'kg', color: '#a1a1aa', font: { size: 11 } },
					},
				},
			},
		});
	}

	private updateChart(): void {
		if (!this.chart) return;
		const data = this.getProgressData(this.selectedExercise);
		const labels = data.map(d => {
			try { return format(parseISO(d.date), 'd MMM yy'); } catch { return d.date; }
		});
		this.chart.data.labels = labels;
		this.chart.data.datasets[0].data = data.map(d => d.maxWeight);
		this.chart.update();
	}

	private destroyChart(): void {
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
	}

	formatDate(dateInput: string): string {
		try {
			return format(parseISO(dateInput), 'dd MMM yyyy');
		} catch {
			return dateInput;
		}
	}

	openDrawer(workoutRecord?: WorkoutRecord): void {
		this.selectedWorkoutRecord = workoutRecord ?? null;
		this.drawerOpen = true;
		this.drawer.open();
	}

	closeDrawer(): void {
		this.drawerOpen = false;
		this.drawer.close();
	}

	onDrawerClosed(): void {
		this.drawerOpen = false;
		this.getAllWorkoutRecords();
	}

	getWorkoutName(workoutId: string): string {
		return this._allWorkouts.find((w) => w._id === workoutId)?.name ?? '—';
	}

	getAllWorkouts() {
		this.workoutsLoading = true;
		this.workoutService.getAllWorkouts().subscribe((workouts) => {
			this._allWorkouts = workouts;
			this.workoutsLoading = false;
		});
	}

	getAllWorkoutRecords(): void {
		this.workoutRecordsLoading = true;
		this.workoutRecordService.getAllWorkoutRecords().subscribe((records) => {
			this._allWorkoutRecords = records;
			this.workoutRecordsLoading = false;
			this.destroyChart();
			if (this.uniqueExercises.length > 0) {
				if (!this.selectedExercise || !this.uniqueExercises.includes(this.selectedExercise)) {
					this.selectedExercise = this.uniqueExercises[0];
				}
				this.chartNeedsInit = true;
			}
		});
	}

	deleteWorkoutRecord(record: WorkoutRecord): void {
		this.workoutRecordService.deleteWorkoutRecord(record._id).subscribe(() => {
			this.getAllWorkoutRecords();
		});
	}
}
