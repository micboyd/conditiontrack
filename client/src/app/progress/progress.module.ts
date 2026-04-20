import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ComparisonToolComponent } from './comparison-tool/comparison-tool.component';
import { FormsModule } from '@angular/forms';
import { MeasurementsComponent } from './measurements/measurements.component';
import { MeasurementsService } from './measurements/measurements.service';
import { NgModule } from '@angular/core';
import { ProgressComponent } from './progress.component';
import { ProgressPhotosComponent } from './progress-photos/progress-photos.component';
import { ProgressPhotosService } from './progress-photos/progress-photos.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TimelineComponent } from './timeline/timeline.component';
import { UploadPhotoComponent } from './progress-photos/upload-photo/upload-photo.component';

@NgModule({
	declarations: [ProgressComponent, ProgressPhotosComponent, UploadPhotoComponent, MeasurementsComponent, TimelineComponent, ComparisonToolComponent],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule, FormsModule],
	providers: [ProgressPhotosService, MeasurementsService],
	exports: [ProgressComponent],
})
export class ProgressModule {}
