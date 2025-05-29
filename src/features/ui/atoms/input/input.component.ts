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
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [value]="value"
        (input)="onInputChange($event)"
        class=""
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;

  @Input() value: string | number = '';
  @Output() valueChange = new EventEmitter<string | number>();

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue =
      this.type === 'number'
        ? inputElement.valueAsNumber || 0
        : inputElement.value;

    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
