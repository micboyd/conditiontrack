import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { AuthUser } from '../shared/models/AuthUser';
import { AuthenticationService } from './authentication.service';
import { Component } from '@angular/core';
import { LoginRequest } from '../shared/models/LoginRequest';
import { Router } from '@angular/router';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
	const password = control.get('password');
	const confirm = control.get('confirmPassword');
	if (password && confirm && password.value !== confirm.value) {
		confirm.setErrors({ mismatch: true });
		return { mismatch: true };
	}
	if (confirm?.hasError('mismatch')) {
		confirm.setErrors(null);
	}
	return null;
}

@Component({
	selector: 'app-authentication',
	templateUrl: './authentication.component.html',
	standalone: false,
})
export class AuthenticationComponent {

	// ── Mode ──────────────────────────────────────────────────────────────────
	mode: 'login' | 'register' | 'success' = 'login';
	registeredEmail = '';

	// ── Login ─────────────────────────────────────────────────────────────────
	loginForm: FormGroup;
	loginErrorMessage = '';
	loginLoading = false;
	keepMeLoggedIn = false;
	unverifiedEmail = ''; // set when login returns 403 unverified

	// ── Register ──────────────────────────────────────────────────────────────
	registerForm: FormGroup;
	registerErrorMessage = '';
	registerLoading = false;

	// ── Resend verification ────────────────────────────────────────────────────
	resendLoading = false;
	resendSent = false;

	constructor(private authService: AuthenticationService, private router: Router) {
		this.loginForm = new FormGroup({
			username: new FormControl('', [Validators.email, Validators.required]),
			password: new FormControl('', [Validators.required]),
		});

		this.registerForm = new FormGroup(
			{
				firstname: new FormControl('', [Validators.required, Validators.minLength(1)]),
				lastname: new FormControl('', [Validators.required, Validators.minLength(1)]),
				username: new FormControl('', [Validators.required, Validators.email]),
				password: new FormControl('', [Validators.required, Validators.minLength(8)]),
				confirmPassword: new FormControl('', [Validators.required]),
			},
			{ validators: passwordMatchValidator },
		);
	}

	ngOnInit() {}

	// ── Helpers ───────────────────────────────────────────────────────────────

	switchTo(mode: 'login' | 'register') {
		this.mode = mode;
		this.loginErrorMessage = '';
		this.registerErrorMessage = '';
		this.unverifiedEmail = '';
		this.resendSent = false;
	}

	isInvalid(form: FormGroup, controlName: string): boolean {
		const control = form.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	// ── Login ─────────────────────────────────────────────────────────────────

	get canSubmitLogin() {
		return this.loginForm.valid && !this.loginLoading;
	}

	onLogin() {
		if (!this.loginForm.valid) {
			this.loginForm.markAllAsTouched();
			return;
		}
		this.loginLoading = true;
		this.loginErrorMessage = '';
		this.unverifiedEmail = '';

		this.authService
			.login(new LoginRequest(this.loginForm.value.username, this.loginForm.value.password, this.keepMeLoggedIn))
			.subscribe({
				next: loginData => {
					this.authService.setDetails(loginData);
					this.router.navigate(['/dashboard']);
					this.loginLoading = false;
				},
				error: err => {
					this.loginLoading = false;
					if (err.status === 403 && err.error?.unverified) {
						this.unverifiedEmail = this.loginForm.value.username;
						this.loginErrorMessage = 'Please verify your email before signing in.';
					} else {
						this.loginErrorMessage = 'Incorrect email or password. Please try again.';
					}
				},
			});
	}

	// ── Register ──────────────────────────────────────────────────────────────

	get canSubmitRegister() {
		return this.registerForm.valid && !this.registerLoading;
	}

	onRegister() {
		if (!this.registerForm.valid) {
			this.registerForm.markAllAsTouched();
			return;
		}
		this.registerLoading = true;
		this.registerErrorMessage = '';

		const { firstname, lastname, username, password } = this.registerForm.value;
		const payload = Object.assign(new AuthUser(), { firstname, lastname, username, password });

		this.authService.register(payload).subscribe({
			next: () => {
				this.registeredEmail = username;
				this.mode = 'success';
				this.registerLoading = false;
			},
			error: err => {
				this.registerLoading = false;
				this.registerErrorMessage = err.error?.msg || 'Something went wrong. Please try again.';
			},
		});
	}

	// ── Resend verification ────────────────────────────────────────────────────

	onResendVerification() {
		this.resendLoading = true;
		this.authService.resendVerification(this.unverifiedEmail || this.registeredEmail).subscribe({
			next: () => {
				this.resendLoading = false;
				this.resendSent = true;
			},
			error: () => {
				this.resendLoading = false;
				this.resendSent = true; // Show sent anyway for security
			},
		});
	}
}
