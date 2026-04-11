import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EditTrainingBlockComponent } from './edit-training-block/edit-training-block.component';
import { TrainingBlocksComponent } from './training-blocks.component';
import { TrainingBlocksService } from './training-blocks.service';

@NgModule({
	declarations: [TrainingBlocksComponent, EditTrainingBlockComponent],
	imports: [CommonModule, SharedModule, ReactiveFormsModule, AppRoutingModule],
	providers: [TrainingBlocksService],
	exports: [TrainingBlocksComponent],
})
export class TrainingBlocksModule {}
