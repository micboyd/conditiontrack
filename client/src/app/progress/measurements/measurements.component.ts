import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { format, parseISO } from 'date-fns';

import { Measurement } from '../models/Measurement';
import { MeasurementsService } from './measurements.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

interface MeasurementGroup {
	monthLabel: string;
	entries: Measurement[];
}

@Component({
	selector: 'app-measurements',
	templateUrl: './measurements.component.html',
	standalone: false,
})
export class MeasurementsComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	measurements: Measurement[] = [];
	selected: Measurement | null = null;
	form: FormGroup;
	loading = false;
	saving = false;
	deletingId: string | null = null;

	// Multi-photo state (up to 3)
	readonly maxPhotos = 3;
	readonly maxPhotoSizeMB = 25;
	readonly maxPhotoSizeBytes = this.maxPhotoSizeMB * 1024 * 1024;

	existingPhotoUrls: string[] = [];   // URLs already saved on the record
	selectedPhotos: File[] = [];        // new files chosen this session
	photoPreviewUrls: string[] = [];    // preview data-URLs for selectedPhotos

	constructor(
		private fb: FormBuilder,
		private measurementsService: MeasurementsService,
	) {
		this.form = Measurement.toFormGroup(null, this.fb);
	}

	ngOnInit(): void {
		this.load();
	}

	load(): void {
		const userId = localStorage.getItem('id') ?? '';
		this.loading = true;
		this.measurementsService.getAll(userId).subscribe({
			next: (data) => {
				this.measurements = data.map(m => new Measurement(m));
				this.loading = false;
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

	get latestWeight():     number | null { return this.measurements.find(m => m.weight     !== null)?.weight     ?? null; }
	get latestMuscleMass(): number | null { return this.measurements.find(m => m.muscleMass !== null)?.muscleMass ?? null; }
	get latestBodyFat():    number | null { return this.measurements.find(m => m.bodyFat    !== null)?.bodyFat    ?? null; }

	/** All photos currently shown in the drawer (existing + new previews) */
	get allDisplayPhotos(): string[] {
		return [...this.existingPhotoUrls, ...this.photoPreviewUrls];
	}

	get canAddMorePhotos(): boolean {
		return this.allDisplayPhotos.length < this.maxPhotos;
	}

	openDrawer(m: Measurement | null): void {
		this.selected = m;
		this.form = Measurement.toFormGroup(m, this.fb);
		this.existingPhotoUrls = [...(m?.photoUrls ?? [])];
		this.selectedPhotos = [];
		this.photoPreviewUrls = [];
		this.drawer.open();
	}

	triggerPhotoInput(): void {
		if (!this.canAddMorePhotos) return;
		(document.getElementById('measurementPhotoInput') as HTMLInputElement)?.click();
	}

	onPhotoSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		const files = Array.from(input.files);
		const remaining = this.maxPhotos - this.allDisplayPhotos.length;
		if (remaining <= 0) { input.value = ''; return; }

		for (const file of files.slice(0, remaining)) {
			if (!file.type.startsWith('image/')) continue;
			if (file.size > this.maxPhotoSizeBytes) continue;
			this.selectedPhotos.push(file);
			const reader = new FileReader();
			reader.onload = e => this.photoPreviewUrls.push(e.target?.result as string);
			reader.readAsDataURL(file);
		}
		input.value = '';
	}

	removePhoto(index: number): void {
		const existingCount = this.existingPhotoUrls.length;
		if (index < existingCount) {
			// Remove an already-saved photo — it simply won't be in keepPhotoUrls on submit
			this.existingPhotoUrls.splice(index, 1);
		} else {
			// Remove a newly selected photo
			const newIndex = index - existingCount;
			this.selectedPhotos.splice(newIndex, 1);
			this.photoPreviewUrls.splice(newIndex, 1);
		}
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
			? this.measurementsService.update(this.selected._id, payload, this.selectedPhotos, this.existingPhotoUrls)
			: this.measurementsService.create(payload, this.selectedPhotos);

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
