import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StrengthComponent } from './strength.component';

@NgModule({
	declarations: [StrengthComponent],
	imports: [CommonModule, AppRoutingModule],
	exports: [StrengthComponent],
})
export class StrengthModule {
}

