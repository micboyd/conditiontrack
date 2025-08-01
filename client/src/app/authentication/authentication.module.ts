import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [AuthenticationComponent],
	imports: [FormsModule, ReactiveFormsModule, CommonModule, SharedModule],
	exports: [AuthenticationComponent],
})
export class AuthenticationModule {
}
