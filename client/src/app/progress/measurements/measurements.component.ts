import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { format, parseISO, subMonths, subYears } from 'date-fns';
import {
	Chart, LineController, LineElement, PointElement,
	LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';

import { Measurement } from '../models/Measurement';
import { MeasurementsService } from './measurements.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface MeasurementGroup {
	monthLabel: string;
	entries: Measurement[];
}

type TimeRange = '3M' | '6M' | '1Y' | 'All';

@Component({
	selector: 'app-measurements',
	templateUrl: './measurements.component.html',
	standalone: false,
})
export class MeasurementsComponent implements OnInit, AfterViewChecked, OnDestroy {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;
	@ViewChild('bodyCompCanvas') canvasRef: ElementRef<HTMLCanvasElement>;

	measurements: Measurement[] = [];
	selected: Measurement | null = null;
	form: FormGroup;
	loading = false;
	saving = false;
	deletingId: string | null = null;

	// Chart state
	selectedRange: TimeRange = 'All';
	showWeight = true;
	showMuscle = true;
	showBodyFat = true;
	private chart: Chart | null = null;
	private chartNeedsInit = false;

	constructor(
		private fb: FormBuilder,
		private measurementsService: MeasurementsService,
	) {
		this.form = Measurement.toFormGroup(null, this.fb);
	}

	ngOnInit(): void {
		this.load();
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

	load(): void {
		const userId = localStorage.getItem('id') ?? '';
		this.loading = true;
		this.measurementsService.getAll(userId).subscribe({
			next: (data) => {
				this.measurements = data.map(m => new Measurement(m));
				this.loading = false;
				this.destroyChart();
				if (this.measurements.length >= 2) {
					this.chartNeedsInit = true;
				}
			},
		});
	}

	get grouped(): MeasurementGroup[] {
		const map = new Map<string, Measurement[]>();
		for (const m of this.measurements) {
			const label = m.date ? format(parseISO(m.date), 'MMMM yyyy') : 'Unknown';
			if (!map.has(label)) map.set(label, []);
			map.get(label)!.push(m);
		}
		return Array.from(map.entries()).map(([monthLabel, entries]) => ({ monthLabel, entries }));
	}

	/** Latest values for the stat strip */
	get latestWeight():     number | null { return this.measurements.find(m => m.weight     !== null)?.weight     ?? null; }
	get latestMuscleMass(): number | null { return this.measurements.find(m => m.muscleMass !== null)?.muscleMass ?? null; }
	get latestBodyFat():    number | null { return this.measurements.find(m => m.bodyFat    !== null)?.bodyFat    ?? null; }

	get showChart(): boolean {
		return this.measurements.length >= 2;
	}

	get filteredMeasurements(): Measurement[] {
		const sorted = [...this.measurements].sort((a, b) => a.date.localeCompare(b.date));
		if (this.selectedRange === 'All') return sorted;
		const cutoff = this.selectedRange === '3M'
			? subMonths(new Date(), 3)
			: this.selectedRange === '6M'
				? subMonths(new Date(), 6)
				: subYears(new Date(), 1);
		const cutoffStr = format(cutoff, 'yyyy-MM-dd');
		return sorted.filter(m => m.date >= cutoffStr);
	}

	setRange(range: TimeRange): void {
		this.selectedRange = range;
		this.updateChart();
	}

	toggleMetric(metric: 'weight' | 'muscle' | 'bodyFat'): void {
		if (metric === 'weight')   this.showWeight   = !this.showWeight;
		if (metric === 'muscle')   this.showMuscle   = !this.showMuscle;
		if (metric === 'bodyFat')  this.showBodyFat  = !this.showBodyFat;
		this.updateChart();
	}

	private initChart(): void {
		if (!this.canvasRef) return;
		this.destroyChart();
		const data = this.filteredMeasurements;
		const labels = data.map(m => {
			try { return format(parseISO(m.date), 'd MMM yy'); } catch { return m.date; }
		});

		this.chart = new Chart(this.canvasRef.nativeElement, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Weight (kg)',
						data: data.map(m => m.weight),
						borderColor: '#18181b',
						backgroundColor: 'transparent',
						tension: 0.3,
						pointRadius: 3,
						borderWidth: 2,
						yAxisID: 'y',
						hidden: !this.showWeight,
						spanGaps: true,
					},
					{
						label: 'Muscle (kg)',
						data: data.map(m => m.muscleMass),
						borderColor: '#3f3f46',
						backgroundColor: 'transparent',
						tension: 0.3,
						pointRadius: 3,
						borderWidth: 2,
						yAxisID: 'y',
						hidden: !this.showMuscle,
						spanGaps: true,
					},
					{
						label: 'Body Fat (%)',
						data: data.map(m => m.bodyFat),
						borderColor: '#71717a',
						backgroundColor: 'transparent',
						tension: 0.3,
						pointRadius: 3,
						borderWidth: 2,
						yAxisID: 'y1',
						hidden: !this.showBodyFat,
						spanGaps: true,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => {
								if (ctx.parsed.y === null) return '';
								const unit = ctx.datasetIndex === 2 ? '%' : ' kg';
								return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}${unit}`;
							},
						},
					},
				},
				scales: {
					x: {
						ticks: { font: { size: 11 }, color: '#a1a1aa' },
						grid: { color: '#f4f4f5' },
					},
					y: {
						position: 'left',
						ticks: { font: { size: 11 }, color: '#a1a1aa' },
						grid: { color: '#f4f4f5' },
						title: { display: true, text: 'kg', color: '#a1a1aa', font: { size: 11 } },
					},
					y1: {
						position: 'right',
						ticks: { font: { size: 11 }, color: '#71717a' },
						grid: { drawOnChartArea: false },
						title: { display: true, text: '%', color: '#71717a', font: { size: 11 } },
					},
				},
			},
		});
	}

	private updateChart(): void {
		if (!this.chart) return;
		const data = this.filteredMeasurements;
		const labels = data.map(m => {
			try { return format(parseISO(m.date), 'd MMM yy'); } catch { return m.date; }
		});
		this.chart.data.labels = labels;
		this.chart.data.datasets[0].data = data.map(m => m.weight);
		this.chart.data.datasets[1].data = data.map(m => m.muscleMass);
		this.chart.data.datasets[2].data = data.map(m => m.bodyFat);
		this.chart.data.datasets[0].hidden = !this.showWeight;
		this.chart.data.datasets[1].hidden = !this.showMuscle;
		this.chart.data.datasets[2].hidden = !this.showBodyFat;
		this.chart.update();
	}

	private destroyChart(): void {
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
	}

	openDrawer(m: Measurement | null): void {
		this.selected = m;
		this.form = Measurement.toFormGroup(m, this.fb);
		this.drawer.open();
	}

	onDateChange(value: string): void {
		this.form.get('date')?.setValue(value);
		this.form.get('date')?.markAsTouched();
	}

	onSubmit(): void {
		if (this.form.invalid || this.saving) return;
		this.saving = true;
		const userId = localStorage.getItem('id') ?? '';
		const v = this.form.value;
		const payload: Partial<Measurement> = {
			userId,
			date:       v.date,
			weight:     v.weight     !== '' && v.weight     !== null ? Number(v.weight)     : null,
			muscleMass: v.muscleMass !== '' && v.muscleMass !== null ? Number(v.muscleMass) : null,
			bodyFat:    v.bodyFat    !== '' && v.bodyFat    !== null ? Number(v.bodyFat)    : null,
			notes:      v.notes ?? '',
		};

		const req = this.selected?._id
			? this.measurementsService.update(this.selected._id, payload)
			: this.measurementsService.create(payload);

		req.subscribe({
			next: () => { this.saving = false; this.drawer.close(); this.load(); },
			error: () => { this.saving = false; },
		});
	}

	delete(m: Measurement): void {
		this.deletingId = m._id;
		this.measurementsService.delete(m._id).subscribe({
			next: () => { this.deletingId = null; this.load(); },
			error: () => { this.deletingId = null; },
		});
	}
}
