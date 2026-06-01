import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SegmentOption {
	label: string;
	value: string;
}

@Component({
	selector: 'app-segmented-control',
	templateUrl: './segmented-control.component.html',
	standalone: false,
})
export class SegmentedControlComponent {
	/** Accepts plain strings (label === value) or {label, value} objects. */
	@Input() set options(value: (string | SegmentOption)[]) {
		this._options = value.map(o => typeof o === 'string' ? { label: o, value: o } : o);
	}
	get options(): SegmentOption[] { return this._options; }
	private _options: SegmentOption[] = [];

	@Input() selected = '';
	/** 'light' = grey tray on light bg, 'dark' = for dark surfaces */
	@Input() theme: 'light' | 'dark' = 'light';

	@Output() selectedChange = new EventEmitter<string>();

	select(value: string): void {
		if (value === this.selected) return;
		this.selected = value;
		this.selectedChange.emit(value);
	}
}
