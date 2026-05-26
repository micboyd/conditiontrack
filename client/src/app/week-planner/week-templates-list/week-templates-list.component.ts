import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WeekTemplate } from '../models/WeekTemplate';
import { WeekTemplateService } from '../week-template.service';
import { DayPlan } from '../models/WeekPlan';

@Component({
	selector: 'app-week-templates-list',
	templateUrl: './week-templates-list.component.html',
	standalone: false,
})
export class WeekTemplatesListComponent implements OnInit {
	loading = false;
	loadError = false;
	templates: WeekTemplate[] = [];
	confirmDeleteId: string | null = null;
	deleting = false;

	constructor(
		private weekTemplateService: WeekTemplateService,
		private router: Router,
	) {}

	ngOnInit() {
		this.loadTemplates();
	}

	loadTemplates() {
		this.loading = true;
		this.loadError = false;
		const userId = localStorage.getItem('id') ?? '';

		this.weekTemplateService.getTemplates(userId).subscribe({
			next: templates => {
				this.templates = templates.map(t => new WeekTemplate(t));
				this.loading = false;
			},
			error: () => {
				this.loading = false;
				this.loadError = true;
			},
		});
	}

	newTemplate() {
		this.router.navigate(['/week-planner/templates/new']);
	}

	editTemplate(id: string) {
		this.router.navigate(['/week-planner/templates', id]);
	}

	goToSchedule(templateId: string) {
		this.router.navigate(['/week-planner/schedule'], { queryParams: { templateId } });
	}

	confirmDelete(id: string) {
		this.confirmDeleteId = id;
	}

	cancelDelete() {
		this.confirmDeleteId = null;
	}

	deleteTemplate(id: string) {
		this.deleting = true;
		this.weekTemplateService.deleteTemplate(id).subscribe({
			next: () => {
				this.templates = this.templates.filter(t => t._id !== id);
				this.confirmDeleteId = null;
				this.deleting = false;
			},
			error: () => {
				this.deleting = false;
			},
		});
	}

	dayHasContent(day: DayPlan): boolean {
		return (
			day.workouts.length > 0 ||
			day.conditioning.length > 0 ||
			day.morning.workouts.length > 0 ||
			day.morning.conditioning.length > 0 ||
			day.afternoon.workouts.length > 0 ||
			day.afternoon.conditioning.length > 0 ||
			day.evening.workouts.length > 0 ||
			day.evening.conditioning.length > 0
		);
	}

	dayLabel(dayName: string): string {
		return dayName.substring(0, 3);
	}
}
