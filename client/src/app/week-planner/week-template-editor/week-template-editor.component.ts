import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ConditioningLibraryService } from '../../conditioning/conditioning-library/conditioning-library.service';
import { ConditioningSession } from '../../conditioning/models/ConditioningSession';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { Workout } from '../../strength/models/Workout';
import { WorkoutService } from '../../strength/workout-library/workout.service';
import { WeekTemplate } from '../models/WeekTemplate';
import { DayPlan, TimeBlockKey } from '../models/WeekPlan';
import { WeekTemplateService } from '../week-template.service';

export type BlockSelection = 'overarching' | TimeBlockKey;

@Component({
	selector: 'app-week-template-editor',
	templateUrl: './week-template-editor.component.html',
	standalone: false,
})
export class WeekTemplateEditorComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	resourcesLoading = false;
	saving = false;
	saved = false;
	saveError = false;
	loadError = false;
	isEditMode = true;

	editingName = false;
	nameInputValue = '';
	editingDescription = false;
	descriptionInputValue = '';

	editingNoteDay: string | null = null;
	noteInputValue = '';

	sessionToView: ConditioningSession | null = null;
	workoutToView: Workout | null = null;

	private _template: WeekTemplate;
	private _selectedDay: DayPlan | null = null;
	private _selectedBlock: BlockSelection = 'overarching';
	private _allWorkouts: Workout[] = [];
	private _allConditioningSessions: ConditioningSession[] = [];

	readonly blocks: { key: BlockSelection; label: string; icon: string }[] = [
		{ key: 'overarching', label: 'All Day',   icon: 'fa-calendar-day' },
		{ key: 'morning',     label: 'Morning',   icon: 'fa-sun' },
		{ key: 'afternoon',   label: 'Afternoon', icon: 'fa-cloud-sun' },
		{ key: 'evening',     label: 'Evening',   icon: 'fa-moon' },
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private weekTemplateService: WeekTemplateService,
		private workoutService: WorkoutService,
		private conditioningLibraryService: ConditioningLibraryService,
	) {}

	get template(): WeekTemplate { return this._template; }
	get selectedDay(): DayPlan | null { return this._selectedDay; }
	get selectedBlock(): BlockSelection { return this._selectedBlock; }
	get allWorkouts(): Workout[] { return this._allWorkouts; }
	get pinnedWorkouts(): Workout[] { return this._allWorkouts.filter(w => w.showInWeekPlanner); }
	get otherWorkouts(): Workout[] { return this._allWorkouts.filter(w => !w.showInWeekPlanner); }
	get allConditioningSessions(): ConditioningSession[] { return this._allConditioningSessions; }

	get drawerTitle(): string {
		if (!this._selectedDay) return '';
		const block = this.blocks.find(b => b.key === this._selectedBlock);
		return `${this._selectedDay.dayName} — ${block?.label ?? ''}`;
	}

	get isNew(): boolean {
		return !this._template?._id;
	}

	ngOnInit() {
		this.resourcesLoading = true;
		this.loadError = false;

		const id = this.route.snapshot.paramMap.get('id');

		forkJoin({
			conditioningSessions: this.conditioningLibraryService.getAllConditioningSessions(),
			workouts: this.workoutService.getAllWorkouts(),
		}).subscribe({
			next: ({ conditioningSessions, workouts }) => {
				this._allConditioningSessions = conditioningSessions;
				this._allWorkouts = workouts;

				if (id) {
					this.loadTemplate(id);
				} else {
					this._template = new WeekTemplate();
					this.isEditMode = true;
					this.resourcesLoading = false;
				}
			},
			error: () => {
				this.resourcesLoading = false;
				this.loadError = true;
			},
		});
	}

	private loadTemplate(id: string) {
		this.weekTemplateService.getTemplate(id).subscribe({
			next: template => {
				this._template = new WeekTemplate(template);
				this.isEditMode = false;
				this.resourcesLoading = false;
			},
			error: () => {
				this.resourcesLoading = false;
				this.loadError = true;
			},
		});
	}

	toggleMode() {
		this.isEditMode = !this.isEditMode;
	}

	goBack() {
		this.router.navigate(['/week-planner/templates']);
	}

	// ── Name / description editing ────────────────────────────────────────────

	startEditName() {
		this.nameInputValue = this._template.name;
		this.editingName = true;
	}

	confirmName() {
		const trimmed = this.nameInputValue.trim();
		if (trimmed) {
			this._template.name = trimmed;
			this.editingName = false;
			this.autoSave();
		}
	}

	cancelEditName() {
		this.editingName = false;
	}

	startEditDescription() {
		this.descriptionInputValue = this._template.description;
		this.editingDescription = true;
	}

	confirmDescription() {
		this._template.description = this.descriptionInputValue.trim();
		this.editingDescription = false;
		this.autoSave();
	}

	cancelEditDescription() {
		this.editingDescription = false;
	}

	// ── Day notes ─────────────────────────────────────────────────────────────

	startNoteEdit(day: DayPlan): void {
		this.editingNoteDay = day.dayName;
		this.noteInputValue = day.note ?? '';
	}

	cancelNoteEdit(): void {
		this.editingNoteDay = null;
		this.noteInputValue = '';
	}

	confirmNote(day: DayPlan): void {
		day.note = this.noteInputValue.trim();
		this.editingNoteDay = null;
		this.noteInputValue = '';
		this.autoSave();
	}

	clearNote(day: DayPlan): void {
		day.note = '';
		this.autoSave();
	}

	// ── Drawer / add items ────────────────────────────────────────────────────

	openDrawer(day: DayPlan, block: BlockSelection) {
		this._selectedDay = day;
		this._selectedBlock = block;
		this.drawer.open();
	}

	addItem(workout?: Workout, session?: ConditioningSession) {
		const day = this._selectedDay?.dayName;
		if (!day) return;

		if (this._selectedBlock === 'overarching') {
			if (workout) this._template.addWorkout(day, workout);
			if (session) this._template.addConditioning(day, session);
		} else {
			if (workout) this._template.addWorkoutToBlock(day, this._selectedBlock, workout);
			if (session) this._template.addConditioningToBlock(day, this._selectedBlock, session);
		}
		this.drawer.close();
		this.autoSave();
	}

	removeWorkout(day: string, workout: Workout) {
		this._template.removeWorkout(day, workout);
		this.autoSave();
	}

	removeConditioning(day: string, session: ConditioningSession) {
		this._template.removeConditioning(day, session);
		this.autoSave();
	}

	removeWorkoutFromBlock(day: string, block: TimeBlockKey, workout: Workout) {
		this._template.removeWorkoutFromBlock(day, block, workout);
		this.autoSave();
	}

	removeConditioningFromBlock(day: string, block: TimeBlockKey, session: ConditioningSession) {
		this._template.removeConditioningFromBlock(day, block, session);
		this.autoSave();
	}

	dropWorkout(event: CdkDragDrop<any[]>, dayName: string, block: 'overarching' | TimeBlockKey) {
		if (event.previousIndex === event.currentIndex) return;
		const day = this._template.days.find(d => d.dayName === dayName);
		if (!day) return;
		const arr = block === 'overarching' ? day.workouts : day[block].workouts;
		moveItemInArray(arr, event.previousIndex, event.currentIndex);
		this.autoSave();
	}

	dropConditioning(event: CdkDragDrop<any[]>, dayName: string, block: 'overarching' | TimeBlockKey) {
		if (event.previousIndex === event.currentIndex) return;
		const day = this._template.days.find(d => d.dayName === dayName);
		if (!day) return;
		const arr = block === 'overarching' ? day.conditioning : day[block].conditioning;
		moveItemInArray(arr, event.previousIndex, event.currentIndex);
		this.autoSave();
	}

	hasAnyContent(day: DayPlan): boolean {
		return (
			day.workouts.length > 0 || day.conditioning.length > 0 ||
			day.morning.workouts.length > 0 || day.morning.conditioning.length > 0 ||
			day.afternoon.workouts.length > 0 || day.afternoon.conditioning.length > 0 ||
			day.evening.workouts.length > 0 || day.evening.conditioning.length > 0
		);
	}

	// ── Auto-save ─────────────────────────────────────────────────────────────

	private autoSave() {
		if (!this._template.name.trim()) return;

		this.saving = true;
		this.saved = false;
		this.saveError = false;

		const payload = this._template.payload();

		const save$ = this._template._id
			? this.weekTemplateService.updateTemplate(this._template._id, payload)
			: this.weekTemplateService.createTemplate(payload);

		save$.subscribe({
			next: (saved) => {
				this._template = new WeekTemplate(saved);
				this.saving = false;
				this.saved = true;
				setTimeout(() => this.saved = false, 2000);
			},
			error: () => {
				this.saving = false;
				this.saveError = true;
				setTimeout(() => this.saveError = false, 3000);
			},
		});
	}

	retryLoad() {
		const id = this.route.snapshot.paramMap.get('id');
		if (id) {
			this.loadError = false;
			this.resourcesLoading = true;
			this.loadTemplate(id);
		}
	}
}
