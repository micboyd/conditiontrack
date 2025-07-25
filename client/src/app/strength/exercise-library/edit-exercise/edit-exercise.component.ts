import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Exercise } from '../../models/Exercise';

@Component({
	selector: 'app-edit-exercise',
	templateUrl: './edit-exercise.component.html',
	standalone: false,
})
export class EditExerciseComponent {
	exerciseForm!: FormGroup;

	@Output() closeEditModeEvent: EventEmitter<void> = new EventEmitter<void>();

	constructor(private fb: FormBuilder) {}

	ngOnInit(): void {
		const sampleExercise = new Exercise('', '', '', []);
		this.exerciseForm = Exercise.toFormGroup(sampleExercise, this.fb);
	}

	closeEditMode(): void {
		this.closeEditModeEvent.emit();
	}

	onSubmit(): void {
		if (this.exerciseForm.valid) {
			console.log('Exercise submitted:', this.exerciseForm.value);
		}
	}
}
