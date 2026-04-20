import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	standalone: false,
	styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
	private sub!: Subscription;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private titleService: Title,
	) {}

	ngOnInit(): void {
		this.sub = this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
		).subscribe(() => {
			let route = this.activatedRoute;
			while (route.firstChild) route = route.firstChild;
			const pageTitle = route.snapshot.data?.['title'] as string | undefined;
			this.titleService.setTitle(pageTitle ? `ConditionTrack — ${pageTitle}` : 'ConditionTrack');
		});
	}

	ngOnDestroy(): void {
		this.sub?.unsubscribe();
	}
}
