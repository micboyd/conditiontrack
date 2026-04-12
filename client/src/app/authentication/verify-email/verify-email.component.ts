import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

type State = 'loading' | 'success' | 'error' | 'missing';

@Component({
	selector: 'app-verify-email',
	templateUrl: './verify-email.component.html',
	standalone: false,
})
export class VerifyEmailComponent implements OnInit {
	state: State = 'loading';
	message = '';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthenticationService,
	) {}

	ngOnInit(): void {
		const token = this.route.snapshot.queryParamMap.get('token');
		if (!token) {
			this.state = 'missing';
			return;
		}
		this.authService.verifyEmail(token).subscribe({
			next: res => {
				this.state = 'success';
				this.message = res.msg;
			},
			error: err => {
				this.state = 'error';
				this.message = err.error?.msg || 'This verification link is invalid or has expired.';
			},
		});
	}

	goToLogin(): void {
		this.router.navigate(['/login']);
	}
}
