import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
	declarations: [AuthenticationComponent, VerifyEmailComponent],
	imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, SharedModule],
	exports: [AuthenticationComponent, VerifyEmailComponent],
})
export class AuthenticationModule {}
