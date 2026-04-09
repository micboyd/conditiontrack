import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProgressPhoto } from '../../models/ProgressPhoto';
import { ProgressPhotosService } from '../progress-photos.service';
import { format } from 'date-fns';

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    standalone: false,
})
export class UploadPhotoComponent implements OnInit {
    @Output() photoUploaded = new EventEmitter<ProgressPhoto>();

    form!: FormGroup;
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    uploading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private progressPhotosService: ProgressPhotosService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            date: [format(new Date(), 'yyyy-MM-dd'), Validators.required],
            notes: [''],
            weight: [null],
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
            this.error = 'Please select an image file.';
            return;
        }

        this.selectedFile = file;
        this.error = '';

        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    onSubmit(): void {
        if (!this.selectedFile) {
            this.error = 'Please select a photo to upload.';
            return;
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.uploading = true;
        this.error = '';

        const userId = localStorage.getItem('id') || '';
        const formData = new FormData();
        formData.append('image', this.selectedFile);
        formData.append('userId', userId);
        formData.append('date', this.form.value.date);
        formData.append('notes', this.form.value.notes || '');
        if (this.form.value.weight !== null && this.form.value.weight !== '') {
            formData.append('weight', this.form.value.weight.toString());
        }

        this.progressPhotosService.uploadPhoto(formData).subscribe({
            next: (photo) => {
                this.uploading = false;
                this.photoUploaded.emit(photo);
                this.resetForm();
            },
            error: (err) => {
                this.uploading = false;
                this.error = err?.error?.error || 'Failed to upload photo. Please try again.';
            },
        });
    }

    resetForm(): void {
        this.selectedFile = null;
        this.previewUrl = null;
        this.error = '';
        this.form.reset({
            date: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
            weight: null,
        });
    }

    triggerFileInput(): void {
        const input = document.getElementById('photoFileInput') as HTMLInputElement;
        if (input) input.click();
    }
}
