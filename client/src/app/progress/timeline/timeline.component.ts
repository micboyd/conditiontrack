import { Component, OnInit } from '@angular/core';
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

    openLightbox(url: string): void {
        this.lightboxUrl = url;
    }

    closeLightbox(): void {
        this.lightboxUrl = null;
    }

    hasStats(m: Measurement): boolean {
        return m.weight !== null || m.muscleMass !== null || m.bodyFat !== null;
    }
}
