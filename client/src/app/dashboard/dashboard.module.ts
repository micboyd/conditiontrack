import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [DashboardComponent],
    imports: [CommonModule, AppRoutingModule],
    exports: [],
})
export class DashboardModule {}

