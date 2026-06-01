import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-empty-state',
	templateUrl: './empty-state.component.html',
	standalone: false,
})
export class EmptyStateComponent {
	@Input() message = '';
	@Input() icon?: string;
	/**
	 * 'card'   = boxed white card with centered text (page-level)
	 * 'inline' = compact text only (inside an existing card)
	 * 'rich'   = boxed card with icon badge + title + description + optional projected CTA
	 */
	@Input() variant: 'card' | 'inline' | 'rich' = 'card';

	// ── Rich variant inputs ──────────────────────────────────────────────────
	@Input() title = '';
	@Input() description?: string;
	@Input() size: 'md' | 'lg' = 'md';
	@Input() iconColor: 'neutral' | 'red' = 'neutral';

	get badgeClass(): string {
		const sz = this.size === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12 rounded-xl';
		const color = this.iconColor === 'red' ? 'bg-red-50' : 'bg-zinc-100';
		return `${sz} ${color}`;
	}

	get iconClass(): string {
		const color = this.iconColor === 'red' ? 'text-red-400' : 'text-zinc-400';
		const sz = this.size === 'lg' ? 'text-xl' : '';
		return `${color} ${sz}`.trim();
	}

	get titleClass(): string {
		return this.size === 'lg'
			? 'text-base font-semibold text-zinc-800'
			: 'text-sm font-medium text-zinc-700';
	}

	get descriptionClass(): string {
		return this.size === 'lg' ? 'text-sm text-zinc-400' : 'text-xs text-zinc-400';
	}
}
