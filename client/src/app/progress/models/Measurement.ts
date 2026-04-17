import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format, parseISO } from 'date-fns';

export class Measurement {
	_id: string;
	userId: string;
	date: string;
	weight: number | null;
	muscleMass: number | null;
	bodyFat: number | null;
	notes: string;
	photoUrls: string[];

	constructor(data?: Partial<Measurement> & { photoUrl?: string | null }) {
		this._id        = data?._id        ?? '';
		this.userId     = data?.userId     ?? '';
		this.date       = data?.date       ?? '';
		this.weight     = data?.weight     ?? null;
		this.muscleMass = data?.muscleMass ?? null;
		this.bodyFat    = data?.bodyFat    ?? null;
		this.notes      = data?.notes      ?? '';
		// Backwards compat: old records may have photoUrl (singular)
		this.photoUrls  = data?.photoUrls?.length
			? data.photoUrls
			: (data?.photoUrl ? [data.photoUrl] : []);
	}

	get dateLabel(): string {
		try { return format(parseISO(this.date), 'd MMM yyyy'); } catch { return this.date; }
	}

	static toFormGroup(m: Measurement | null, fb: FormBuilder): FormGroup {
		return fb.group({
			date:       [m?.date       ?? format(new Date(), 'yyyy-MM-dd'), Validators.required],
			weight:     [m?.weight     ?? null],
			muscleMass: [m?.muscleMass ?? null],
			bodyFat:    [m?.bodyFat    ?? null],
			notes:      [m?.notes      ?? ''],
		});
	}
}
