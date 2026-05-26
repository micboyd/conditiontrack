import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WeekPlannerComponent } from './week-planner.component';
import { WeekPlannerService } from './week-planner.service';
import { WeekTemplateService } from './week-template.service';
import { WeekTemplatesListComponent } from './week-templates-list/week-templates-list.component';
import { WeekTemplateEditorComponent } from './week-template-editor/week-template-editor.component';
import { WeekScheduleComponent } from './week-schedule/week-schedule.component';
import { TrainingBlocksService } from '../training-blocks/training-blocks.service';

@NgModule({
	declarations: [
		WeekPlannerComponent,
		WeekTemplatesListComponent,
		WeekTemplateEditorComponent,
		WeekScheduleComponent,
	],
	imports: [CommonModule, AppRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, DragDropModule],
	exports: [],
	providers: [WeekPlannerService, WeekTemplateService, TrainingBlocksService],
})
export class WeekPlannerModule {}

