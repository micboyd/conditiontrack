import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { GoalsComponent } from './goals.component';
import { EditGoalComponent } from './edit-goal/edit-goal.component';
import { GoalsService } from './goals.service';

@NgModule({
	declarations: [GoalsComponent, EditGoalComponent],
	imports: [CommonModule, SharedModule, ReactiveFormsModule, FormsModule, AppRoutingModule],
	providers: [GoalsService],
	exports: [GoalsComponent],
})
export class GoalsModule {}
