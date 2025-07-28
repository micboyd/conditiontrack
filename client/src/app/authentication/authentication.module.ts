import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
	declarations: [AuthenticationComponent],
	imports: [FormsModule, ReactiveFormsModule, CommonModule],
	exports: [AuthenticationComponent],
})
export class AuthenticationModule {
}
