import { Component, OnInit } from '@angular/core';
import { Measurement } from '../models/Measurement';
import { MeasurementsService } from '../measurements/measurements.service';

interface PhotoSelection {
	url: string;
	date: string;
	dateLabel: string;
	weight: number | null;
	muscleMass: number | null;
	bodyFat: number | null;
}

@Component({
	selector: 'app-comparison-tool',
	templateUrl: './comparison-tool.component.html',
	standalone: false,
})
export class ComparisonToolComponent implements OnInit {
	loading = true;
	measurements: Measurement[] = [];

	leftPhoto: PhotoSelection | null = null;
	rightPhoto: PhotoSelection | null = null;
	selectingFor: 'left' | 'right' | null = null;
	blurImages = true;

	constructor(private measurementsService: MeasurementsService) {}

	ngOnInit(): void {
		const userId = localStorage.getItem('id') ?? '';
		this.measurementsService.getAll(userId).subscribe({
			next: (data) => {
				this.measurements = data
					.map(m => new Measurement(m))
					.filter(m => m.photoUrls?.length > 0)
					.sort((a, b) => b.date.localeCompare(a.date));
				this.loading = false;
			},
			error: () => { this.loading = false; },
		});
	}

	get isSelecting(): boolean {
		return this.selectingFor !== null;
	}

	startSelecting(side: 'left' | 'right'): void {
		this.selectingFor = this.selectingFor === side ? null : side;
	}

	pickPhoto(url: string, m: Measurement): void {
		const selection: PhotoSelection = {
			url,
			date: m.date,
			dateLabel: m.dateLabel,
			weight: m.weight,
			muscleMass: m.muscleMass,
			bodyFat: m.bodyFat,
		};
		if (this.selectingFor === 'left') {
			this.leftPhoto = selection;
		} else if (this.selectingFor === 'right') {
			this.rightPhoto = selection;
		}
		this.selectingFor = null;
	}

	clearPhoto(side: 'left' | 'right'): void {
		if (side === 'left') this.leftPhoto = null;
		else this.rightPhoto = null;
	}
}
