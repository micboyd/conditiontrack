import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format, parseISO } from 'date-fns';
import { forkJoin } from 'rxjs';

import { ConditioningRecordService } from '../conditioning/conditioning-records/conditioning-records.service';
import { UserProfile, UserService } from '../shared/services/user.service';
import { WorkoutRecordService } from '../strength/workout-records/workout-records.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	standalone: false,
})
export class ProfileComponent implements OnInit {
	@ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

	user: UserProfile | null = null;
	profileForm: FormGroup;
	avatarPreview: string | null = null;
	selectedFile: File | null = null;
	saving = false;
	saved = false;
	loading = false;

	workoutCount = 0;
	cardioCount = 0;

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
				this.saving = false;
				this.saved = true;
				setTimeout(() => this.saved = false, 2000);
			},
			error: () => { this.saving = false; },
		});
	}
}
