import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { format, subMonths, subYears, parseISO } from 'date-fns';

import { Exercise } from '../../strength/models/Exercise';
import { WorkoutRecord } from '../../strength/models/WorkoutRecord';
import { Workout } from '../../strength/models/Workout';
import { TrainingBlock } from '../../training-blocks/models/TrainingBlock';
import { ExerciseService } from '../../strength/exercise-library/exercise.service';
import { WorkoutRecordService } from '../../strength/workout-records/workout-records.service';
import { WorkoutService } from '../../strength/workout-library/workout.service';
import { TrainingBlocksService } from '../../training-blocks/training-blocks.service';
import { SelectOption } from '../../shared/components/select/select.component';

export type TimeRange = '1M' | '6M' | '1Y' | 'block';

interface CompExercise {
    name: string;
    setsA: { reps: number; weight: number }[];
    setsB: { reps: number; weight: number }[];
    volA: number;
    volB: number;
    maxA: number;
    maxB: number;
}

@Component({
    selector: 'app-strength-stats',
    templateUrl: './strength-stats.component.html',
    standalone: false,
})
export class StrengthStatsComponent implements OnInit {
    exercises: Exercise[] = [];
    allWorkouts: Workout[] = [];
    trainingBlocks: TrainingBlock[] = [];
    allRecords: WorkoutRecord[] = [];

    loading = false;
    loadError = false;

    // Strength progression
    selectedExerciseName: string | null = null;
    selectedRange: TimeRange = '1M';
    selectedBlockId: string | null = null;
    chartMode: 'maxWeight' | 'est1rm' = 'maxWeight';

    // Personal Bests
    pbSelectedExercises: string[] = ['', '', '', ''];
    private readonly PB_STORAGE_KEY = 'stats_pb_exercises';

    readonly ranges: { key: TimeRange; label: string }[] = [
        { key: '1M', label: '1M' },
        { key: '6M', label: '6M' },
        { key: '1Y', label: '1Y' },
        { key: 'block', label: 'Block' },
    ];

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
                ticks: { font: { size: 12 }, maxTicksLimit: 8 },
            },
            y: {
                grid: { color: '#f4f4f5' },
                ticks: { font: { size: 12 }, callback: val => `${val} kg` },
            },
        },
        elements: {
            line: { tension: 0.3, borderWidth: 2 },
            point: { radius: 4, hoverRadius: 6 },
        },
    };

    // Workout Comparison
    compWorkoutId: string | null = null;
    compSlotA: { month: string | null; record: WorkoutRecord | null } = { month: null, record: null };
    compSlotB: { month: string | null; record: WorkoutRecord | null } = { month: null, record: null };

    constructor(
        private exerciseService: ExerciseService,
        private workoutRecordService: WorkoutRecordService,
        private workoutService: WorkoutService,
        private trainingBlocksService: TrainingBlocksService,
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

        forkJoin({
            exercises: this.exerciseService.getAllExercises(),
            records: this.workoutRecordService.getAllWorkoutRecords(),
            workouts: this.workoutService.getAllWorkouts(),
            blocks: this.trainingBlocksService.getAllBlocks(),
        }).subscribe({
            next: ({ exercises, records, workouts, blocks }) => {
                this.exercises = exercises.sort((a, b) => a.name.localeCompare(b.name));
                this.allRecords = records;
                this.allWorkouts = workouts.sort((a, b) => a.name.localeCompare(b.name));
                this.trainingBlocks = blocks
                    .map(b => new TrainingBlock(b))
                    .sort((a, b) => b.startDate.localeCompare(a.startDate));
                this.loading = false;
                this.loadPbExercises();
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
        if (this.selectedRange === '1M') return { from: format(subMonths(today, 1), 'yyyy-MM-dd'), to: todayStr };
        if (this.selectedRange === '6M') return { from: format(subMonths(today, 6), 'yyyy-MM-dd'), to: todayStr };
        if (this.selectedRange === '1Y') return { from: format(subYears(today, 1), 'yyyy-MM-dd'), to: todayStr };
        if (this.selectedRange === 'block' && this.selectedBlock) {
            return { from: this.selectedBlock.startDate, to: this.selectedBlock.endDate ?? todayStr };
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

        this.chartData = {
            labels: sorted.map(([date]) => format(parseISO(date), 'd MMM')),
            datasets: [{
                data: sorted.map(([, value]) => value),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                pointBackgroundColor: '#7c3aed',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }],
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

    // ── Workout Comparison ────────────────────────────────────────────────────

    get compWorkoutOptions(): SelectOption[] {
        const idsWithRecords = new Set(this.allRecords.map(r => r.workoutId));
        return this.allWorkouts
            .filter(w => idsWithRecords.has(w._id))
            .map(w => ({ value: w._id, label: w.name }));
    }

    onCompWorkoutChange(id: string): void {
        this.compWorkoutId = id || null;
        this.compSlotA = { month: null, record: null };
        this.compSlotB = { month: null, record: null };
    }

    get compFilteredRecords(): WorkoutRecord[] {
        if (!this.compWorkoutId) return [];
        return this.allRecords
            .filter(r => r.workoutId === this.compWorkoutId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    get compAvailableMonths(): string[] {
        const months = [...new Set(this.compFilteredRecords.map(r => (r.date ?? '').slice(0, 7)))];
        return months.filter(Boolean).sort((a, b) => b.localeCompare(a));
    }

    compRecordsForMonth(month: string): WorkoutRecord[] {
        return this.compFilteredRecords.filter(r => (r.date ?? '').startsWith(month));
    }

    selectCompMonth(slot: 'A' | 'B', month: string): void {
        if (slot === 'A') this.compSlotA = { month, record: null };
        else this.compSlotB = { month, record: null };
    }

    selectCompRecord(slot: 'A' | 'B', record: WorkoutRecord): void {
        if (slot === 'A') this.compSlotA = { ...this.compSlotA, record };
        else this.compSlotB = { ...this.compSlotB, record };
    }

    get compReady(): boolean {
        return !!(this.compSlotA.record && this.compSlotB.record);
    }

    formatMonthLabel(ym: string): string {
        try { return format(parseISO(ym + '-01'), 'MMM yyyy'); } catch { return ym; }
    }

    formatRecordDate(dateStr: string): string {
        try { return format(parseISO(dateStr), 'EEE d MMM yyyy'); } catch { return dateStr; }
    }

    formatRecordDateShort(dateStr: string): string {
        try { return format(parseISO(dateStr), 'd MMM yyyy'); } catch { return dateStr; }
    }

    recordVolume(record: WorkoutRecord): number {
        return record.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0);
    }

    get compResults(): CompExercise[] {
        if (!this.compReady) return [];
        const a = this.compSlotA.record!;
        const b = this.compSlotB.record!;
        const names = [...new Set([...a.exercises.map(e => e.name), ...b.exercises.map(e => e.name)])];
        return names.map(name => {
            const exA = a.exercises.find(e => e.name === name);
            const exB = b.exercises.find(e => e.name === name);
            const setsA = exA?.sets ?? [];
            const setsB = exB?.sets ?? [];
            const volA = setsA.reduce((s, x) => s + x.reps * x.weight, 0);
            const volB = setsB.reduce((s, x) => s + x.reps * x.weight, 0);
            const maxA = setsA.length ? Math.max(0, ...setsA.map(s => s.weight)) : 0;
            const maxB = setsB.length ? Math.max(0, ...setsB.map(s => s.weight)) : 0;
            return { name, setsA, setsB, volA, volB, maxA, maxB };
        });
    }

    compSetRows(ex: CompExercise): { setA: { reps: number; weight: number } | null; setB: { reps: number; weight: number } | null }[] {
        const len = Math.max(ex.setsA.length, ex.setsB.length);
        return Array.from({ length: len }, (_, i) => ({
            setA: ex.setsA[i] ?? null,
            setB: ex.setsB[i] ?? null,
        }));
    }

    deltaLabel(a: number, b: number): string {
        const diff = b - a;
        if (diff > 0) return `+${diff}`;
        if (diff < 0) return `${diff}`;
        return '=';
    }

    deltaClass(a: number, b: number): string {
        const diff = b - a;
        if (diff > 0) return 'text-emerald-600';
        if (diff < 0) return 'text-red-500';
        return 'text-zinc-400';
    }
}
