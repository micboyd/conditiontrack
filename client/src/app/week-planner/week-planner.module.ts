import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WeekPlannerComponent } from './week-planner.component';
import { WeekPlannerService } from './week-planner.service';
import { TrainingBlocksService } from '../training-blocks/training-blocks.service';

@NgModule({
	declarations: [
        WeekPlannerComponent
	],
	imports: [CommonModule, AppRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, DragDropModule],
	exports: [],
	providers: [WeekPlannerService, TrainingBlocksService],
})
export class WeekPlannerModule {}

