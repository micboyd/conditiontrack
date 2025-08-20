import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WeekPlannerComponent } from './week-planner.component';
import { WeekPlannerService } from './week-planner.service';

@NgModule({
	declarations: [
        WeekPlannerComponent
	],
	imports: [CommonModule, AppRoutingModule, ReactiveFormsModule, SharedModule],
	exports: [],
	providers: [WeekPlannerService],
})
export class WeekPlannerModule {}

