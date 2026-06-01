import { Component, Input } from '@angular/core';

type TileColor = 'neutral' | 'blue' | 'green' | 'orange' | 'amber' | 'purple';

@Component({
	selector: 'app-stat-tile',
	templateUrl: './stat-tile.component.html',
	standalone: false,
})
export class StatTileComponent {
	@Input() icon?: string;
	@Input() label = '';
	@Input() value: string | number = '';
	@Input() unit?: string;
	/** Optional secondary value rendered after the main value, e.g. "/ 7" */
	@Input() suffix?: string;
	@Input() color: TileColor = 'neutral';

	private readonly styles: Record<TileColor, { box: string; accent: string }> = {
		neutral: { box: 'bg-white border border-zinc-100', accent: 'text-zinc-400' },
		blue:    { box: 'bg-blue-50',                       accent: 'text-blue-400' },
		green:   { box: 'bg-green-50',                      accent: 'text-green-500' },
		orange:  { box: 'bg-orange-50',                     accent: 'text-orange-400' },
		amber:   { box: 'bg-amber-50',                      accent: 'text-amber-500' },
		purple:  { box: 'bg-purple-50',                     accent: 'text-purple-400' },
	};

	get boxClass(): string { return this.styles[this.color].box; }
	get accentClass(): string { return this.styles[this.color].accent; }
}
