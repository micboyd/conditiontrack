import { Component, HostListener, OnInit } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { Measurement } from '../models/Measurement';
import { MeasurementsService } from '../measurements/measurements.service';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    standalone: false,
})
export class TimelineComponent implements OnInit {
    measurements: Measurement[] = [];
    loading = true;
    lightboxUrl: string | null = null;
    lightboxPhotos: string[] = [];
    lightboxIndex = 0;
    blurImages = true;

    constructor(private measurementsService: MeasurementsService) {}

    ngOnInit(): void {
        const userId = localStorage.getItem('id') ?? '';
        this.measurementsService.getAll(userId).subscribe({
            next: (data) => {
                this.measurements = data
                    .map(m => new Measurement(m))
                    .sort((a, b) => b.date.localeCompare(a.date));
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    get grouped(): { monthLabel: string; entries: Measurement[] }[] {
        const map = new Map<string, Measurement[]>();
        for (const m of this.measurements) {
            const label = m.date ? format(parseISO(m.date), 'MMMM yyyy') : 'Unknown';
            if (!map.has(label)) map.set(label, []);
            map.get(label)!.push(m);
        }
        return Array.from(map.entries()).map(([monthLabel, entries]) => ({ monthLabel, entries }));
    }

    globalIndex(m: Measurement): number {
        return this.measurements.indexOf(m);
    }

    hasPhotos(m: Measurement): boolean {
        return m.photoUrls?.length > 0;
    }

    hasStats(m: Measurement): boolean {
        return m.weight !== null || m.muscleMass !== null || m.bodyFat !== null;
    }

    openLightbox(photos: string[], index = 0): void {
        // Build a flat list of every photo across all entries so arrows span the whole timeline
        this.lightboxPhotos = this.measurements.flatMap(m => m.photoUrls);
        const clickedUrl = photos[index];
        const globalIndex = this.lightboxPhotos.indexOf(clickedUrl);
        this.lightboxIndex = globalIndex !== -1 ? globalIndex : 0;
        this.lightboxUrl = this.lightboxPhotos[this.lightboxIndex];
    }

    prevPhoto(): void {
        if (this.lightboxIndex > 0) {
            this.lightboxIndex--;
            this.lightboxUrl = this.lightboxPhotos[this.lightboxIndex];
        }
    }

    nextPhoto(): void {
        if (this.lightboxIndex < this.lightboxPhotos.length - 1) {
            this.lightboxIndex++;
            this.lightboxUrl = this.lightboxPhotos[this.lightboxIndex];
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(e: KeyboardEvent): void {
        if (!this.lightboxUrl) return;
        if (e.key === 'ArrowLeft')  this.prevPhoto();
        if (e.key === 'ArrowRight') this.nextPhoto();
        if (e.key === 'Escape')     this.closeLightbox();
    }

    closeLightbox(): void {
        this.lightboxUrl = null;
        this.lightboxPhotos = [];
        this.lightboxIndex = 0;
    }

    toggleBlur(): void {
        this.blurImages = !this.blurImages;
    }

    statCount(m: Measurement): number {
        return [m.weight, m.muscleMass, m.bodyFat].filter(v => v !== null).length;
    }

    private delta(index: number, field: 'weight' | 'muscleMass' | 'bodyFat'): number | null {
        const curr = this.measurements[index]?.[field];
        const prev = this.measurements[index + 1]?.[field];
        if (curr === null || curr === undefined || prev === null || prev === undefined) return null;
        const diff = +(curr - prev).toFixed(1);
        return diff === 0 ? null : diff;
    }

    weightDelta(i: number): string | null {
        const d = this.delta(i, 'weight');
        return d === null ? null : `${d > 0 ? '+' : ''}${d.toFixed(1)} kg`;
    }

    muscleDelta(i: number): string | null {
        const d = this.delta(i, 'muscleMass');
        return d === null ? null : `${d > 0 ? '+' : ''}${d.toFixed(1)} kg`;
    }

    bodyFatDelta(i: number): string | null {
        const d = this.delta(i, 'bodyFat');
        return d === null ? null : `${d > 0 ? '+' : ''}${d.toFixed(1)}%`;
    }

    muscleDeltaPositive(i: number): boolean { return (this.delta(i, 'muscleMass') ?? 0) > 0; }
    bodyFatDeltaPositive(i: number): boolean { return (this.delta(i, 'bodyFat') ?? 0) > 0; }
}
