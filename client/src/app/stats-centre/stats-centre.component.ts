import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { format, subMonths, subYears, parseISO } from 'date-fns';

import { Exercise } from '../strength/models/Exercise';
import { WorkoutRecord } from '../strength/models/WorkoutRecord';
import { TrainingBlock } from '../training-blocks/models/TrainingBlock';
import { Measurement } from '../progress/models/Measurement';
import { ExerciseService } from '../strength/exercise-library/exercise.service';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';
import { TrainingBlocksService } from '../training-blocks/training-blocks.service';
import { MeasurementsService } from '../progress/measurements/measurements.service';
import { SelectOption } from '../shared/components/select/select.component';

export type TimeRange = '1M' | '6M' | '1Y' | 'block';
export type BodyCompRange = '3M' | '6M' | '1Y' | 'All';

@Component({
    selector: 'app-stats-centre',
    templateUrl: './stats-centre.component.html',
    standalone: false,
})
export class StatsCentreComponent implements OnInit {
    exercises: Exercise[] = [];
    trainingBlocks: TrainingBlock[] = [];
    allRecords: WorkoutRecord[] = [];
    measurements: Measurement[] = [];

    loading = false;
    loadError = false;

    // Strength progression state
    selectedExerciseName: string | null = null;
    selectedRange: TimeRange = '1M';
    selectedBlockId: string | null = null;
    chartMode: 'maxWeight' | 'est1rm' = 'maxWeight';

    // Personal Bests state
    pbSelectedExercises: string[] = ['', '', '', ''];
    private readonly PB_STORAGE_KEY = 'stats_pb_exercises';

    // Body composition state
    bodyCompRange: BodyCompRange = 'All';
    showWeight = true;
    showMuscle = true;
    showBodyFat = true;

    readonly ranges: { key: TimeRange; label: string }[] = [
        { key: '1M', label: '1M' },
        { key: '6M', label: '6M' },
        { key: '1Y', label: '1Y' },
        { key: 'block', label: 'Block' },
    ];

    readonly bodyCompRanges: BodyCompRange[] = ['3M', '6M', '1Y', 'All'];

    // Strength chart
    chartData: ChartData<'line'> = { labels: [], datasets: [] };

    chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => ` ${ctx.parsed.y} kg${this.chartMode === 'est1rm' ? ' (est.)' : ''}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 12 },
                    maxTicksLimit: 8,
                },
            },
            y: {
                grid: { color: '#f4f4f5' },
                ticks: {
                    font: { size: 12 },
                    callback: val => `${val} kg`,
                },
            },
        },
        elements: {
            line: { tension: 0.3, borderWidth: 2 },
            point: { radius: 4, hoverRadius: 6 },
        },
    };

    // Body composition chart
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
                ticks: {
                    font: { size: 12 },
                    callback: val => `${val} kg`,
                },
                title: { display: true, text: 'kg', color: '#a1a1aa', font: { size: 11 } },
            },
            y1: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: {
                    font: { size: 12 },
                    callback: val => `${val}%`,
                    color: '#71717a',
                },
                title: { display: true, text: '%', color: '#71717a', font: { size: 11 } },
            },
        },
        elements: {
            line: { tension: 0.3, borderWidth: 2 },
            point: { radius: 3, hoverRadius: 5 },
        },
    };

    constructor(
        private exerciseService: ExerciseService,
        private workoutRecordService: WorkoutRecordService,
        private trainingBlocksService: TrainingBlocksService,
        private measurementsService: MeasurementsService,
    ) {}

    get exerciseOptions(): SelectOption[] {
        return this.exercises.map(e => ({ value: e.name, label: e.name }));
    }

    get blockOptions(): SelectOption[] {
        return this.trainingBlocks.map(b => ({
            value: b._id,
            label: `${b.name} — ${b.dateRangeLabel}`,
        }));
    }

    ngOnInit(): void {
        this.loading = true;
        this.loadError = false;
        const userId = localStorage.getItem('id') ?? '';

        forkJoin({
            exercises: this.exerciseService.getAllExercises(),
            records: this.workoutRecordService.getAllWorkoutRecords(),
            blocks: this.trainingBlocksService.getAllBlocks(),
            measurements: this.measurementsService.getAll(userId),
        }).subscribe({
            next: ({ exercises, records, blocks, measurements }) => {
                this.exercises = exercises.sort((a, b) => a.name.localeCompare(b.name));
                this.allRecords = records;
                this.trainingBlocks = blocks
                    .map(b => new TrainingBlock(b))
                    .sort((a, b) => b.startDate.localeCompare(a.startDate));
                this.measurements = measurements.map(m => new Measurement(m));
                this.loading = false;
                this.loadPbExercises();
                this.buildBodyCompChart();
            },
            error: () => {
                this.loading = false;
                this.loadError = true;
            },
        });
    }

    // ── Strength Progression ──────────────────────────────────────────────────

    onExerciseChange(name: string): void {
        this.selectedExerciseName = name || null;
        this.buildChart();
    }

    onRangeChange(range: TimeRange): void {
        this.selectedRange = range;
        if (range !== 'block') this.selectedBlockId = null;
        this.buildChart();
    }

    onBlockChange(id: string): void {
        this.selectedBlockId = id || null;
        this.buildChart();
    }

    onChartModeChange(mode: 'maxWeight' | 'est1rm'): void {
        this.chartMode = mode;
        this.buildChart();
    }

    get selectedBlock(): TrainingBlock | undefined {
        return this.trainingBlocks.find(b => b._id === this.selectedBlockId);
    }

    get dateRange(): { from: string; to: string } {
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');

        if (this.selectedRange === '1M') {
            return { from: format(subMonths(today, 1), 'yyyy-MM-dd'), to: todayStr };
        }
        if (this.selectedRange === '6M') {
            return { from: format(subMonths(today, 6), 'yyyy-MM-dd'), to: todayStr };
        }
        if (this.selectedRange === '1Y') {
            return { from: format(subYears(today, 1), 'yyyy-MM-dd'), to: todayStr };
        }
        if (this.selectedRange === 'block' && this.selectedBlock) {
            return {
                from: this.selectedBlock.startDate,
                to: this.selectedBlock.endDate ?? todayStr,
            };
        }
        return { from: format(subMonths(today, 1), 'yyyy-MM-dd'), to: todayStr };
    }

    buildChart(): void {
        if (!this.selectedExerciseName) {
            this.chartData = { labels: [], datasets: [] };
            return;
        }

        const name = this.selectedExerciseName.toLowerCase();
        const { from, to } = this.dateRange;

        const valueByDate = new Map<string, number>();

        for (const record of this.allRecords) {
            const recordDate = (record.date ?? '').slice(0, 10);
            if (recordDate < from || recordDate > to) continue;

            const exercise = record.exercises.find(e => e.name.toLowerCase() === name);
            if (!exercise || exercise.sets.length === 0) continue;

            if (this.chartMode === 'maxWeight') {
                const weights = exercise.sets.map(s => s.weight).filter(w => w > 0);
                if (weights.length === 0) continue;
                const maxWeight = Math.max(...weights);
                const existing = valueByDate.get(recordDate) ?? 0;
                if (maxWeight > existing) valueByDate.set(recordDate, maxWeight);
            } else {
                // Epley estimated 1RM: weight × (1 + reps / 30)
                for (const set of exercise.sets) {
                    if (set.weight > 0 && set.reps > 0) {
                        const e1rm = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
                        const existing = valueByDate.get(recordDate) ?? 0;
                        if (e1rm > existing) valueByDate.set(recordDate, e1rm);
                    }
                }
            }
        }

        const sorted = Array.from(valueByDate.entries()).sort(([a], [b]) => a.localeCompare(b));
        const labels = sorted.map(([date]) => format(parseISO(date), 'd MMM'));
        const data = sorted.map(([, value]) => value);

        this.chartData = {
            labels,
            datasets: [
                {
                    data,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    fill: true,
                    pointBackgroundColor: '#7c3aed',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
            ],
        };
    }

    get hasData(): boolean {
        return (this.chartData.datasets[0]?.data?.length ?? 0) > 0;
    }

    // ── Personal Bests ────────────────────────────────────────────────────────

    getPersonalBest(name: string): number | null {
        if (!name) return null;
        const lower = name.toLowerCase();
        let max: number | null = null;
        for (const record of this.allRecords) {
            const ex = record.exercises.find(e => e.name.toLowerCase() === lower);
            if (!ex || ex.sets.length === 0) continue;
            const weights = ex.sets.map(s => s.weight).filter(w => w > 0);
            if (weights.length === 0) continue;
            const m = Math.max(...weights);
            if (max === null || m > max) max = m;
        }
        return max;
    }

    /** Estimated 1RM using the Epley formula: weight × (1 + reps / 30). Returns the best across all records. */
    getEstimated1RM(name: string): number | null {
        if (!name) return null;
        const lower = name.toLowerCase();
        let best: number | null = null;
        for (const record of this.allRecords) {
            const ex = record.exercises.find(e => e.name.toLowerCase() === lower);
            if (!ex) continue;
            for (const set of ex.sets) {
                if (set.weight > 0 && set.reps > 0) {
                    const e1rm = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
                    if (best === null || e1rm > best) best = e1rm;
                }
            }
        }
        return best;
    }

    setPbExercise(slot: number, name: string): void {
        this.pbSelectedExercises[slot] = name || '';
        localStorage.setItem(this.PB_STORAGE_KEY, JSON.stringify(this.pbSelectedExercises));
    }

    private loadPbExercises(): void {
        try {
            const stored = localStorage.getItem(this.PB_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    this.pbSelectedExercises = [...parsed, '', '', '', ''].slice(0, 4).map(v => v ?? '');
                }
            }
        } catch { /* ignore */ }
    }

    // ── Body Composition ──────────────────────────────────────────────────────

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
