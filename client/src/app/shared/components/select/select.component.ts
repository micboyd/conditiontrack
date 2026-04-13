import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
    value: string;
    label: string;
}

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true,
        },
    ],
})
export class SelectComponent implements ControlValueAccessor, OnDestroy {
    @Input() options: SelectOption[] = [];
    @Input() placeholder = 'Select...';
    @Input() disabled = false;
    @Output() valueChange = new EventEmitter<string>();

    @ViewChild('triggerBtn') triggerBtn!: ElementRef<HTMLButtonElement>;

    isOpen = false;
    value = '';
    panelStyle: Record<string, string> = {};

    private onChange: (v: string) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private elRef: ElementRef) {}

    ngOnDestroy(): void {
        this.isOpen = false;
    }

    get selectedLabel(): string {
        return this.options.find(o => o.value === this.value)?.label ?? '';
    }

    toggle(): void {
        if (this.disabled) return;
        if (this.isOpen) {
            this.isOpen = false;
            return;
        }
        const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const panelMaxH = 240;
        const openUpward = rect.bottom + panelMaxH > viewportHeight;

        this.panelStyle = {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: '9999',
            ...(openUpward
                ? { bottom: `${viewportHeight - rect.top + 4}px`, top: 'auto' }
                : { top: `${rect.bottom + 4}px`, bottom: 'auto' }),
        };
        this.isOpen = true;
    }

    select(option: SelectOption, event: Event): void {
        event.stopPropagation();
        this.value = option.value;
        this.onChange(this.value);
        this.onTouched();
        this.valueChange.emit(this.value);
        this.isOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        if (this.isOpen && !this.elRef.nativeElement.contains(event.target as Node)) {
            this.isOpen = false;
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isOpen) this.isOpen = false;
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event: Event): void {
        // Don't close when scrolling inside the panel itself
        const panel = document.querySelector('.app-select-panel');
        if (panel && panel.contains(event.target as Node)) return;
        this.isOpen = false;
    }

    @HostListener('window:resize')
    onResize(): void {
        this.isOpen = false;
    }

    // ControlValueAccessor
    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: (v: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
