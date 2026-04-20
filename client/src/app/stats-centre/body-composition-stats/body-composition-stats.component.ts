import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { format, subMonths, subYears, parseISO } from 'date-fns';

import { Measurement } from '../../progress/models/Measurement';
import { MeasurementsService } from '../../progress/measurements/measurements.service';

export type BodyCompRange = '3M' | '6M' | '1Y' | 'All';

@Component({
    selector: 'app-body-composition-stats',
    templateUrl: './body-composition-stats.component.html',
    standalone: false,
})
export class BodyCompositionStatsComponent implements OnInit {
    measurements: Measurement[] = [];

    loading = false;
    loadError = false;

    bodyCompRange: BodyCompRange = 'All';
    showWeight = true;
    showMuscle = true;
    showBodyFat = true;

    readonly bodyCompRanges: BodyCompRange[] = ['3M', '6M', '1Y', 'All'];

    bodyCompChartData: ChartData<'line'> = { labels: [], datasets: [] };

    bodyCompChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => {
                        if (ctx.parsed.y === null) return '';
                        const unit = ctx.datasetIndex === 2 ? '%' : ' kg';
                        return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}${unit}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 }, maxTicksLimit: 8 },
            },
            y: {
                position: 'left',
                grid: { color: '#f4f4f5' },
                ticks: { font: { size: 12 }, callback: val => `${val} kg` },
                title: { display: true, text: 'kg', color: '#a1a1aa', font: { size: 11 } },
            },
            y1: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 12 }, callback: val => `${val}%`, color: '#71717a' },
                title: { display: true, text: '%', color: '#71717a', font: { size: 11 } },
            },
        },
        elements: {
            line: { tension: 0.3, borderWidth: 2 },
            point: { radius: 3, hoverRadius: 5 },
        },
    };

    constructor(private measurementsService: MeasurementsService) {}

    ngOnInit(): void {
        this.loading = true;
        this.loadError = false;
        const userId = localStorage.getItem('id') ?? '';

        this.measurementsService.getAll(userId).subscribe({
            next: (measurements) => {
                this.measurements = measurements.map(m => new Measurement(m));
                this.loading = false;
                this.buildBodyCompChart();
            },
            error: () => {
                this.loading = false;
                this.loadError = true;
            },
        });
    }

    get filteredMeasurements(): Measurement[] {
        const sorted = [...this.measurements].sort((a, b) => a.date.localeCompare(b.date));
        if (this.bodyCompRange === 'All') return sorted;
        const today = new Date();
        const cutoff = this.bodyCompRange === '3M'
            ? subMonths(today, 3)
            : this.bodyCompRange === '6M'
                ? subMonths(today, 6)
                : subYears(today, 1);
        const cutoffStr = format(cutoff, 'yyyy-MM-dd');
        return sorted.filter(m => m.date >= cutoffStr);
    }

    get hasBodyCompData(): boolean {
        return this.measurements.length >= 2;
    }

    onBodyCompRangeChange(range: BodyCompRange): void {
        this.bodyCompRange = range;
        this.buildBodyCompChart();
    }

    toggleMetric(metric: 'weight' | 'muscle' | 'bodyFat'): void {
        if (metric === 'weight')  this.showWeight  = !this.showWeight;
        if (metric === 'muscle')  this.showMuscle  = !this.showMuscle;
        if (metric === 'bodyFat') this.showBodyFat = !this.showBodyFat;
        this.buildBodyCompChart();
    }

    buildBodyCompChart(): void {
        const data = this.filteredMeasurements;
        const labels = data.map(m => {
            try { return format(parseISO(m.date), 'd MMM yy'); } catch { return m.date; }
        });

        this.bodyCompChartData = {
            labels,
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: data.map(m => m.weight) as number[],
                    borderColor: '#18181b',
                    backgroundColor: 'transparent',
                    yAxisID: 'y',
                    hidden: !this.showWeight,
                    spanGaps: true,
                    pointBackgroundColor: '#18181b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
                {
                    label: 'Muscle (kg)',
                    data: data.map(m => m.muscleMass) as number[],
                    borderColor: '#3f3f46',
                    backgroundColor: 'transparent',
                    yAxisID: 'y',
                    hidden: !this.showMuscle,
                    spanGaps: true,
                    pointBackgroundColor: '#3f3f46',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
                {
                    label: 'Body Fat (%)',
                    data: data.map(m => m.bodyFat) as number[],
                    borderColor: '#71717a',
                    backgroundColor: 'transparent',
                    yAxisID: 'y1',
                    hidden: !this.showBodyFat,
                    spanGaps: true,
                    pointBackgroundColor: '#71717a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
            ],
        };
    }
}
