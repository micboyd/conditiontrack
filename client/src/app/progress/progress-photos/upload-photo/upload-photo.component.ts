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
        const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));

        if (invalidFiles.length > 0) {
            this.error = `${invalidFiles.length} file(s) are not valid image files.`;
            return;
        }

        this.selectedFiles = files;
        this.error = '';
        this.previewUrls = [];

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrls.push(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        });
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
                this.error = err?.error?.error || 'Failed to upload photos. Please try again.';
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
