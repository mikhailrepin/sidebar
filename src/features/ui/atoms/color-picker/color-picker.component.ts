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
  selector: 'ui-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col">
      <label
        *ngIf="label"
        [for]="id"
        class="mb-1 text-sm font-medium text-gray-700"
      >
        {{ label }}
      </label>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-md border border-gray-300 shadow-sm"
          [style.backgroundColor]="value"
        ></div>
        <input
          [id]="id"
          type="text"
          [disabled]="disabled"
          [value]="value"
          (input)="onInputChange($event)"
          class="rounded border border-gray-300 px-3 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 w-32"
        />
        <input
          type="color"
          [disabled]="disabled"
          [value]="value"
          (input)="onColorChange($event)"
          class="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @Input() value: string = '#000000';
  @Output() valueChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;

    // Add # if it doesn't exist
    if (newValue && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }

    // Simple validation to check if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      this.updateValue(newValue);
    }
  }

  onColorChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    this.updateValue(newValue);
  }

  updateValue(newValue: string): void {
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
