import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { format, subMonths, subYears, parseISO } from 'date-fns';

import { Exercise } from '../strength/models/Exercise';
import { WorkoutRecord } from '../strength/models/WorkoutRecord';
import { TrainingBlock } from '../training-blocks/models/TrainingBlock';
import { ExerciseService } from '../strength/exercise-library/exercise.service';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';
import { TrainingBlocksService } from '../training-blocks/training-blocks.service';
import { SelectOption } from '../shared/components/select/select.component';

export type TimeRange = '1M' | '6M' | '1Y' | 'block';

@Component({
    selector: 'app-stats-centre',
    templateUrl: './stats-centre.component.html',
    standalone: false,
})
export class StatsCentreComponent implements OnInit {
    exercises: Exercise[] = [];
    trainingBlocks: TrainingBlock[] = [];
    allRecords: WorkoutRecord[] = [];

    loading = false;
    loadError = false;

    selectedExerciseName: string | null = null;
    selectedRange: TimeRange = '1M';
    selectedBlockId: string | null = null;

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
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => ` ${ctx.parsed.y} kg`,
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

    constructor(
        private exerciseService: ExerciseService,
        private workoutRecordService: WorkoutRecordService,
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
            blocks: this.trainingBlocksService.getAllBlocks(),
        }).subscribe({
            next: ({ exercises, records, blocks }) => {
                this.exercises = exercises.sort((a, b) => a.name.localeCompare(b.name));
                this.allRecords = records;
                this.trainingBlocks = blocks
                    .map(b => new TrainingBlock(b))
                    .sort((a, b) => b.startDate.localeCompare(a.startDate));
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.loadError = true;
            },
        });
    }

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

        // Collect max weight per date
        const weightByDate = new Map<string, number>();

        for (const record of this.allRecords) {
            // Strip any time component from record.date before comparing
            const recordDate = (record.date ?? '').slice(0, 10);
            if (recordDate < from || recordDate > to) continue;

            const exercise = record.exercises.find(e => e.name.toLowerCase() === name);
            if (!exercise || exercise.sets.length === 0) continue;

            const weights = exercise.sets.map(s => s.weight).filter(w => w > 0);
            if (weights.length === 0) continue;

            const maxWeight = Math.max(...weights);
            const existing = weightByDate.get(recordDate) ?? 0;
            if (maxWeight > existing) {
                weightByDate.set(recordDate, maxWeight);
            }
        }

        // Sort by date
        const sorted = Array.from(weightByDate.entries()).sort(([a], [b]) => a.localeCompare(b));

        const labels = sorted.map(([date]) => format(parseISO(date), 'd MMM'));
        const data = sorted.map(([, weight]) => weight);

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
}
