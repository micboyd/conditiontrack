import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format, parseISO, subDays } from 'date-fns';
import { forkJoin } from 'rxjs';

import { ConditioningRecord } from '../conditioning/models/ConditioningRecord';
import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { UserProfile, UserService } from '../shared/services/user.service';
import { WorkoutRecord } from '../strength/models/WorkoutRecord';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	standalone: false,
})
export class ProfileComponent implements OnInit, OnDestroy {
	@ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

	user: UserProfile | null = null;
	profileForm: FormGroup;
	avatarPreview: string | null = null;
	selectedFile: File | null = null;
	saving = false;
	saved = false;
	loading = false;
	isEditing = false;

	workoutCount = 0;
	cardioCount = 0;
	totalTrainingHours = 0;
	currentStreak = 0;

	private savedTimer?: ReturnType<typeof setTimeout>;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
		private workoutRecordService: WorkoutRecordService,
		private conditioningRecordService: ConditioningRecordService,
	) {
		this.profileForm = this.fb.group({
			firstname: ['', Validators.required],
			lastname:  ['', Validators.required],
			username:  ['', Validators.required],
			bio:       [''],
		});
	}

	ngOnInit(): void {
		const id = localStorage.getItem('id');
		if (!id) return;
		this.loading = true;

		forkJoin({
			user:     this.userService.getUser(id),
			workouts: this.workoutRecordService.getAllWorkoutRecords(),
			cardio:   this.conditioningRecordService.getAllConditioningRecords(),
		}).subscribe({
			next: ({ user, workouts, cardio }) => {
				this.user = user;
				this.workoutCount = workouts.length;
				this.cardioCount  = cardio.length;
				this.totalTrainingHours = this.computeTrainingHours(workouts, cardio);
				this.currentStreak      = this.computeStreak(workouts, cardio);
				this.profileForm.patchValue({
					firstname: user.firstname,
					lastname:  user.lastname,
					username:  user.username,
					bio:       user.bio ?? '',
				});
				this.loading = false;
			},
		});
	}

	ngOnDestroy(): void {
		clearTimeout(this.savedTimer);
	}

	// ── Computed getters ─────────────────────────────────────────────────────

	get initials(): string {
		if (!this.user) return '';
		return `${this.user.firstname?.[0] ?? ''}${this.user.lastname?.[0] ?? ''}`.toUpperCase();
	}

	get memberSince(): string {
		if (!this.user?.createdAt) return '—';
		try { return format(parseISO(this.user.createdAt), 'MMM yyyy'); } catch { return '—'; }
	}

	get avatarSrc(): string | null {
		return this.avatarPreview ?? this.user?.profileImage ?? null;
	}

	// ── Edit mode ────────────────────────────────────────────────────────────

	startEdit(): void {
		this.isEditing = true;
	}

	cancelEdit(): void {
		this.isEditing = false;
		this.avatarPreview = null;
		this.selectedFile = null;
		if (this.user) {
			this.profileForm.patchValue({
				firstname: this.user.firstname,
				lastname:  this.user.lastname,
				username:  this.user.username,
				bio:       this.user.bio ?? '',
			});
		}
		this.profileForm.markAsPristine();
		this.profileForm.markAsUntouched();
	}

	// ── Avatar upload ────────────────────────────────────────────────────────

	triggerFileInput(): void {
		this.fileInput.nativeElement.click();
	}

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		this.selectedFile = file;
		const reader = new FileReader();
		reader.onload = (e) => { this.avatarPreview = e.target?.result as string; };
		reader.readAsDataURL(file);
	}

	// ── Save ─────────────────────────────────────────────────────────────────

	onSubmit(): void {
		if (this.profileForm.invalid || this.saving) return;
		const id = localStorage.getItem('id');
		if (!id) return;

		this.saving = true;
		const v = this.profileForm.value;
		const formData = new FormData();
		formData.append('firstname', v.firstname);
		formData.append('lastname',  v.lastname);
		formData.append('username',  v.username);
		formData.append('bio',       v.bio ?? '');
		if (this.selectedFile) formData.append('image', this.selectedFile);

		this.userService.updateUser(id, formData).subscribe({
			next: (updated) => {
				this.user = { ...this.user!, ...updated };
				this.selectedFile = null;
				this.avatarPreview = null;
				this.saving = false;
				this.saved = true;
				this.isEditing = false;
				clearTimeout(this.savedTimer);
				this.savedTimer = setTimeout(() => this.saved = false, 2500);
			},
			error: () => { this.saving = false; },
		});
	}

	// ── Stats helpers ─────────────────────────────────────────────────────────

	private computeTrainingHours(workouts: WorkoutRecord[], cardio: ConditioningRecord[]): number {
		const totalMins = [...workouts, ...cardio].reduce((s, r) => s + (r.duration || 0), 0);
		return Math.round((totalMins / 60) * 10) / 10;
	}

	private computeStreak(workouts: WorkoutRecord[], cardio: ConditioningRecord[]): number {
		const activeDates = new Set(
			[
				...workouts.map(w => w.date?.slice(0, 10)),
				...cardio.map(c => c.date?.slice(0, 10)),
			].filter((d): d is string => !!d)
		);

		let streak = 0;
		let cursor = new Date();

		// If nothing logged today, try counting back from yesterday
		if (!activeDates.has(format(cursor, 'yyyy-MM-dd'))) {
			cursor = subDays(cursor, 1);
		}

		while (activeDates.has(format(cursor, 'yyyy-MM-dd'))) {
			streak++;
			cursor = subDays(cursor, 1);
		}
		return streak;
	}
}
