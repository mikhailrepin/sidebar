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
import { OptionItem } from '../../../prop-sidebar/types/prop-sidebar.types';

@Component({
  selector: 'ui-select',
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
      <div class="relative">
        <select
          [id]="id"
          [disabled]="disabled"
          [value]="value"
          (change)="onChange($event)"
          class="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option
            *ngFor="let option of options"
            [value]="option.value"
            [selected]="option.value === value"
          >
            {{ option.label }}
          </option>
        </select>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
        >
          <svg
            class="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </svg>
        </div>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() options: OptionItem[] = [];

  @Input() value: string | number = '';
  @Output() valueChange = new EventEmitter<string | number>();

  private onChangeCallback: (value: string | number) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  onChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newValue = selectElement.value;

    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChangeCallback(newValue);
    this.onTouchedCallback();
  }

  writeValue(value: string | number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
