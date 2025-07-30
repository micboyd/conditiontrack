import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from '../../models/Exercise';
import { ExerciseService } from '../exercise.service';

@Component({
	selector: 'app-edit-exercise',
	templateUrl: './edit-exercise.component.html',
	standalone: false,
})
export class EditExerciseComponent {
	exerciseForm!: FormGroup;
	formLoading: boolean = false;

	@Input() selectedExercise: Exercise | null = null;
	@Output() closeEditModeEvent = new EventEmitter<void>();

	constructor(private fb: FormBuilder, public exerciseService: ExerciseService) {}

	ngOnInit(): void {
		this.exerciseForm = Exercise.toFormGroup(this.selectedExercise ?? new Exercise(null), this.fb);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	isInvalid(controlName: string): boolean {
		const control = this.exerciseForm.get(controlName);
		return !!(control && control.invalid && control.touched);
	}

	onSubmit(): void {
		this.formLoading = true;

		if (this.selectedExercise) {
			this.exerciseService.updateExercise(this.selectedExercise._id, this.exerciseForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		} else {
			this.exerciseService.createExercise(this.exerciseForm.value).subscribe(() => {
				this.closeEditModeEvent.emit();
				this.formLoading = false;
			});
		}
	}
}

