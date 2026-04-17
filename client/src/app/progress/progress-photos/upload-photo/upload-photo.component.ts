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
    selectedFiles: File[] = [];
    previewUrls: string[] = [];
    uploading = false;
    error = '';

    readonly maxFileSizeMB = 25;
    readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024;
    readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    readonly allowedTypesLabel = 'JPG, PNG, WEBP, GIF';

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

        const files = Array.from(input.files);
        const errors: string[] = [];
        const validFiles: File[] = [];

        for (const file of files) {
            if (!this.allowedTypes.includes(file.type)) {
                errors.push(`"${file.name}" is not a supported format (allowed: ${this.allowedTypesLabel}).`);
            } else if (file.size > this.maxFileSizeBytes) {
                const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                errors.push(`"${file.name}" is ${sizeMB}MB — exceeds the ${this.maxFileSizeMB}MB limit.`);
            } else {
                validFiles.push(file);
            }
        }

        if (errors.length > 0) {
            this.error = errors.join(' ');
            // Still accept the valid files if there were some
            if (validFiles.length === 0) return;
        } else {
            this.error = '';
        }

        this.selectedFiles = [...this.selectedFiles, ...validFiles];

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrls.push(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        });

        // Reset input so the same file can be re-selected after removal
        input.value = '';
    }

    onSubmit(): void {
        if (this.selectedFiles.length === 0) {
            this.error = 'Please select at least one photo to upload.';
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

        this.selectedFiles.forEach((file) => {
            formData.append('images', file);
        });
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
                const serverMsg = err?.error?.error;
                const statusCode = err?.status;
                if (serverMsg) {
                    this.error = serverMsg;
                } else if (statusCode === 413) {
                    this.error = `File is too large. The maximum allowed size is ${this.maxFileSizeMB}MB.`;
                } else if (statusCode === 0) {
                    this.error = 'Could not reach the server. Check your connection and try again.';
                } else {
                    this.error = 'Upload failed. Please try again.';
                }
            },
        });
    }

    resetForm(): void {
        this.selectedFiles = [];
        this.previewUrls = [];
        this.error = '';
        this.form.reset({
            date: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
            weight: null,
        });
    }

    removePreview(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.previewUrls.splice(index, 1);
    }

    triggerFileInput(): void {
        const input = document.getElementById('photoFileInput') as HTMLInputElement;
        if (input) input.click();
    }
}
