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
  selector: 'ui-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col w-full">
      <div class="flex justify-between items-center mb-2" *ngIf="label">
        <label [for]="id" class="text-sm font-medium text-text-shaded">{{
          label
        }}</label>
        <span *ngIf="showValue" class="text-sm text-text-disabled">{{
          value
        }}</span>
      </div>
      <div class="flex items-center gap-2">
        <input
          [id]="id"
          type="range"
          [min]="min"
          [max]="max"
          [step]="step"
          [disabled]="disabled"
          [value]="value"
          (input)="onInputChange($event)"
          class="w-full h-2 bg-elevation-level-2 rounded-lg appearance-none cursor-pointer accent-primary-default"
        />
        <input
          *ngIf="showInput"
          type="number"
          [min]="min"
          [max]="max"
          [step]="step"
          [disabled]="disabled"
          [value]="value"
          (input)="onNumberChange($event)"
          class="w-16 rounded border border-elevation-border px-2 py-1 text-right text-sm"
        />
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() disabled: boolean = false;
  @Input() showInput: boolean = false;
  @Input() showValue: boolean = true;

  @Input() value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.valueAsNumber;

    this.updateValue(newValue);
  }

  onNumberChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.valueAsNumber;

    // Clamp the value between min and max
    newValue = Math.max(this.min, Math.min(this.max, newValue));

    this.updateValue(newValue);
  }

  updateValue(newValue: number): void {
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
