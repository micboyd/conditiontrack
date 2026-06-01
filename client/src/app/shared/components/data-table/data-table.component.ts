import { Component, Input } from '@angular/core';

export interface DataTableColumn {
	label?: string;
	align?: 'left' | 'right';
	class?: string;
}

@Component({
	selector: 'app-data-table',
	templateUrl: './data-table.component.html',
	standalone: false,
})
export class DataTableComponent {
	@Input() columns: (string | DataTableColumn)[] = [];

	get cols(): Required<DataTableColumn>[] {
		return this.columns.map((c) =>
			typeof c === 'string'
				? { label: c, align: 'left' as const, class: '' }
				: { label: c.label ?? '', align: c.align ?? 'left', class: c.class ?? '' },
		);
	}
}
