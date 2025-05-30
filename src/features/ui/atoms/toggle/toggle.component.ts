import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center">
      <button
        type="button"
        role="switch"
        [id]="id"
        [attr.aria-checked]="value"
        [attr.disabled]="disabled ? true : null"
        (click)="toggle()"
        [class]="getToggleClasses()"
      >
        <span aria-hidden="true" [class]="getKnobClasses()"></span>
      </button>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() disabled: boolean = false;

  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled) return;

    const newValue = !this.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  getToggleClasses(): string {
    const baseClasses =
      'relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-2';
    const colorClasses = this.value
      ? 'bg-primary-default'
      : 'bg-elevation-level-2';
    const stateClasses = this.disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return `${baseClasses} ${colorClasses} ${stateClasses}`;
  }

  getKnobClasses(): string {
    const baseClasses =
      'inline-block h-4 w-4 transform rounded-full bg-elevation-white transition';
    const positionClasses = this.value ? 'translate-x-6' : 'translate-x-1';

    return `${baseClasses} ${positionClasses}`;
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
