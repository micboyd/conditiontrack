import { GlobalSettingsComponent } from './global-settings.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [GlobalSettingsComponent],
    imports: [CommonModule, SharedModule, ReactiveFormsModule],
    exports: [],
})
export class GlobalSettingsModule {
}

