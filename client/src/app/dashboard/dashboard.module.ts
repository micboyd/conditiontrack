import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { ConditioningWidgetComponent } from './widgets/conditioning-widget/conditioing-widget.component';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';
import { StrengthWidgetComponent } from './widgets/strength-widget/strength-widget.component';
import { WorkoutService } from '../strength/workout-library/workout.service';

@NgModule({
    declarations: [DashboardComponent, StrengthWidgetComponent, ConditioningWidgetComponent],
    imports: [CommonModule, AppRoutingModule],
    exports: [],
    providers: [WorkoutService],
})
export class DashboardModule {}

