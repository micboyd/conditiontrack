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
    lightboxPhotos: string[] = [];
    lightboxIndex = 0;

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

    hasPhotos(m: Measurement): boolean {
        return m.photoUrls?.length > 0;
    }

    hasStats(m: Measurement): boolean {
        return m.weight !== null || m.muscleMass !== null || m.bodyFat !== null;
    }

    openLightbox(photos: string[], index = 0): void {
        this.lightboxPhotos = photos;
        this.lightboxIndex = index;
        this.lightboxUrl = photos[index];
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

    closeLightbox(): void {
        this.lightboxUrl = null;
        this.lightboxPhotos = [];
        this.lightboxIndex = 0;
    }
}
