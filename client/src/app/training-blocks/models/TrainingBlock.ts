import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format, parseISO } from 'date-fns';

export class TrainingBlock {
	_id: string;
	userId: string;
	name: string;
	startDate: string;   // 'yyyy-MM-dd'
	endDate: string | null;
	notes: string;

	constructor(data?: Partial<TrainingBlock>) {
		this._id       = data?._id       ?? '';
		this.userId    = data?.userId    ?? localStorage.getItem('id') ?? '';
		this.name      = data?.name      ?? '';
		this.startDate = data?.startDate ?? '';
		this.endDate   = data?.endDate   ?? null;
		this.notes     = data?.notes     ?? '';
	}

	get isActive(): boolean {
		if (!this.startDate) return false;
		const today = format(new Date(), 'yyyy-MM-dd');
		return today >= this.startDate && (this.endDate === null || today <= this.endDate);
	}

	get status(): 'active' | 'upcoming' | 'completed' {
		if (!this.startDate) return 'upcoming';
		const today = format(new Date(), 'yyyy-MM-dd');
		if (today < this.startDate) return 'upcoming';
		if (this.endDate && today > this.endDate) return 'completed';
		return 'active';
	}

	get dateRangeLabel(): string {
		const start = this.startDate ? format(parseISO(this.startDate), 'd MMM yyyy') : '—';
		const end   = this.endDate   ? format(parseISO(this.endDate),   'd MMM yyyy') : 'ongoing';
		return `${start} → ${end}`;
	}

	static toFormGroup(block: TrainingBlock | null, fb: FormBuilder): FormGroup {
		return fb.group({
			name:      [block?.name      ?? '', Validators.required],
			startDate: [block?.startDate ?? '', Validators.required],
			endDate:   [block?.endDate   ?? null],
			notes:     [block?.notes     ?? ''],
		});
	}

	/** Returns the first overlapping block, or null. Excludes self by _id. */
	static checkOverlap(
		start: string,
		end: string | null,
		blocks: TrainingBlock[],
		excludeId?: string,
	): TrainingBlock | null {
		if (!start) return null;
		const eEnd = end || '9999-12-31';
		return blocks.find(b => {
			if (excludeId && b._id === excludeId) return false;
			const bEnd = b.endDate || '9999-12-31';
			return start <= bEnd && b.startDate <= eEnd;
		}) ?? null;
	}
}
