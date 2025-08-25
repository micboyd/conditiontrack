import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ConditioningWidgetComponent } from './widgets/conditioning-widget/conditioning-widget.component';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { StrengthWidgetComponent } from './widgets/strength-widget/strength-widget.component';
import { SummaryWidgetComponent } from './widgets/summary-widget/summary-widget.component';
import { WorkoutService } from '../strength/workout-library/workout.service';

@NgModule({
    declarations: [DashboardComponent, StrengthWidgetComponent, ConditioningWidgetComponent, SummaryWidgetComponent],
    imports: [CommonModule, AppRoutingModule, SharedModule],
    exports: [],
    providers: [WorkoutService],
})
export class DashboardModule {}

