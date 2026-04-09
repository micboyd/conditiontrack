import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ProgressComponent } from './progress.component';
import { ProgressPhotosComponent } from './progress-photos/progress-photos.component';
import { ProgressPhotosService } from './progress-photos/progress-photos.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UploadPhotoComponent } from './progress-photos/upload-photo/upload-photo.component';

@NgModule({
    declarations: [ProgressComponent, ProgressPhotosComponent, UploadPhotoComponent],
    imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule, FormsModule],
    providers: [ProgressPhotosService],
    exports: [ProgressComponent],
})
export class ProgressModule {}
