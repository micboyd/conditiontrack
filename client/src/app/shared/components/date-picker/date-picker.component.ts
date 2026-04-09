import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { format, parseISO } from 'date-fns';

@Component({
	selector: 'app-date-picker',
	templateUrl: './date-picker.component.html',
	standalone: false,
})
export class DatePickerComponent implements OnChanges {
	/** Currently selected date as yyyy-MM-dd string */
	@Input() value: string = '';
	/** Upper limit date as yyyy-MM-dd string. Empty = no limit. */
	@Input() maxDate: string = '';
	/** 'icon' = small calendar button (dashboard). 'field' = full-width form input. */
	@Input() displayMode: 'icon' | 'field' = 'field';
	/** Placeholder text shown in field mode when no date selected */
	@Input() placeholder: string = 'Select a date';

	@Output() valueChange = new EventEmitter<string>();

	isOpen = false;
	pickerMonth: Date = new Date();

	readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

	ngOnChanges(): void {
		// Keep picker month in sync if value changes externally
		if (this.value) {
			try { this.pickerMonth = parseISO(this.value); } catch { /* ignore */ }
		}
	}

	get displayLabel(): string {
		if (!this.value) return this.placeholder;
		try { return format(parseISO(this.value), 'd MMM yyyy'); } catch { return this.placeholder; }
	}

	get monthLabel(): string {
		return format(this.pickerMonth, 'MMMM yyyy');
	}

	get nextMonthDisabled(): boolean {
		if (!this.maxDate) return false;
		const max = parseISO(this.maxDate);
		return (
			this.pickerMonth.getFullYear() > max.getFullYear() ||
			(this.pickerMonth.getFullYear() === max.getFullYear() &&
				this.pickerMonth.getMonth() >= max.getMonth())
		);
	}

	get days(): (Date | null)[] {
		const year = this.pickerMonth.getFullYear();
		const month = this.pickerMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const totalDays = new Date(year, month + 1, 0).getDate();
		const offset = (firstDay.getDay() + 6) % 7; // Mon = 0
		const cells: (Date | null)[] = Array(offset).fill(null);
		for (let d = 1; d <= totalDays; d++) {
			cells.push(new Date(year, month, d));
		}
		return cells;
	}

	toggle(): void {
		if (!this.isOpen) {
			this.pickerMonth = this.value ? parseISO(this.value) : new Date();
		}
		this.isOpen = !this.isOpen;
	}

	close(): void {
		this.isOpen = false;
	}

	prevMonth(): void {
		const d = new Date(this.pickerMonth);
		d.setMonth(d.getMonth() - 1);
		this.pickerMonth = d;
	}

	nextMonth(): void {
		if (this.nextMonthDisabled) return;
		const d = new Date(this.pickerMonth);
		d.setMonth(d.getMonth() + 1);
		this.pickerMonth = d;
	}

	selectDate(date: Date): void {
		if (this.isDisabled(date)) return;
		const dateStr = format(date, 'yyyy-MM-dd');
		this.value = dateStr;
		this.valueChange.emit(dateStr);
		this.isOpen = false;
	}

	isSelected(date: Date): boolean {
		return !!this.value && format(date, 'yyyy-MM-dd') === this.value;
	}

	isDayToday(date: Date): boolean {
		return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
	}

	isDisabled(date: Date): boolean {
		if (!this.maxDate) return false;
		return format(date, 'yyyy-MM-dd') > this.maxDate;
	}
}
