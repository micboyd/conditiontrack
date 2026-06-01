import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ConditioningSession } from '../../../conditioning/models/ConditioningSession';

@Component({
	selector: 'app-session-detail',
	templateUrl: './session-detail.component.html',
	standalone: false,
})
export class SessionDetailComponent {
	@Input() session!: ConditioningSession;

	@Output() close = new EventEmitter<void>();
}
