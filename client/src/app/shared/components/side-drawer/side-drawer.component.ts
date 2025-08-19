import { Component, HostListener, Input } from '@angular/core';

@Component({
	selector: 'app-side-drawer',
	templateUrl: './side-drawer.component.html',
	standalone: false,
})
export class SideDrawerComponent {

    @Input()
    showButton = false;

	isOpen = false;

	@Input() side: 'right' | 'left' = 'right';

	/** Optional: widths per breakpoint */
	@Input() widths = { base: 'w-full', md: 'lg:w-[50%]', lg: 'lg:w-[50%]' };

	ngOnDestroy(): void {
		this.unlockScroll();
	}

	open() {
		this.isOpen = true;
		this.lockScroll();
	}

	close() {
		this.isOpen = false;
		this.unlockScroll();
	}

	toggle() {
		this.isOpen ? this.close() : this.open();
	}

	@HostListener('document:keydown.escape')
	onEsc() {
		if (this.isOpen) this.close();
	}

	private lockScroll() {
		document.documentElement.classList.add('overflow-hidden');
	}

	private unlockScroll() {
		document.documentElement.classList.remove('overflow-hidden');
	}
}
