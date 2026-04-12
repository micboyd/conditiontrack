import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MacroGoals, UserService } from '../shared/services/user.service';

@Component({
	selector: 'app-global-settings',
	templateUrl: './global-settings.component.html',
	standalone: false,
})
export class GlobalSettingsComponent implements OnInit {
	form!: FormGroup;
	loading = false;
	saving = false;
	saved = false;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
	) {}

	ngOnInit(): void {
		this.form = this.fb.group({
			calories: [0, [Validators.min(0)]],
			protein:  [0, [Validators.min(0)]],
			carbs:    [0, [Validators.min(0)]],
			fat:      [0, [Validators.min(0)]],
		});

		const id = localStorage.getItem('id') ?? '';
		this.loading = true;
		this.userService.getUser(id).subscribe({
			next: user => {
				if (user.macroGoals) {
					this.form.patchValue(user.macroGoals);
				}
				this.loading = false;
			},
			error: () => { this.loading = false; },
		});
	}

	onSubmit(): void {
		if (!this.form.valid) return;
		const id = localStorage.getItem('id') ?? '';
		this.saving = true;
		this.saved = false;
		this.userService.updateMacroGoals(id, this.form.value as MacroGoals).subscribe({
			next: () => {
				this.saving = false;
				this.saved = true;
				setTimeout(() => this.saved = false, 2500);
			},
			error: () => { this.saving = false; },
		});
	}
}
