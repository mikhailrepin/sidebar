import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PropertyItem,
  TextProperty,
  NumberProperty,
  ColorProperty,
  DateProperty,
  SelectProperty,
  SliderProperty,
  ToggleProperty,
} from '../../types/prop-sidebar.types';
import {
  InputComponent,
  SliderComponent,
  ToggleComponent,
  ColorPickerComponent,
  SelectComponent,
} from '../../../ui/atoms';

@Component({
  selector: 'app-property-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputComponent,
    SliderComponent,
    ToggleComponent,
    ColorPickerComponent,
    SelectComponent,
  ],
  template: `
    <div class="mb-4 last:mb-0">
      <ng-container [ngSwitch]="property.type">
        <!-- Text input -->
        <ui-input
          *ngSwitchCase="'text'"
          [id]="property.id"
          [label]="property.label"
          [value]="getTextValue()"
          [disabled]="property.disabled || readonly"
          [readonly]="property.readonly || readonly"
          [placeholder]="getTextPlaceholder()"
          (valueChange)="onValueChange($event)"
        ></ui-input>

        <!-- Number input -->
        <ui-input
          *ngSwitchCase="'number'"
          [id]="property.id"
          [label]="property.label"
          [type]="'number'"
          [value]="getNumberValue()"
          [disabled]="property.disabled || readonly"
          [readonly]="property.readonly || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-input>

        <!-- Color picker -->
        <ui-color-picker
          *ngSwitchCase="'color'"
          [id]="property.id"
          [label]="property.label"
          [value]="getColorValue()"
          [disabled]="property.disabled || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-color-picker>

        <!-- Date picker -->
        <ui-input
          *ngSwitchCase="'date'"
          [id]="property.id"
          [label]="property.label"
          [value]="getDateValue()"
          [disabled]="property.disabled || readonly"
          [readonly]="property.readonly || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-input>

        <!-- Select -->
        <ui-select
          *ngSwitchCase="'select'"
          [id]="property.id"
          [label]="property.label"
          [value]="getSelectValue()"
          [options]="getSelectOptions()"
          [disabled]="property.disabled || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-select>

        <!-- Slider -->
        <ui-slider
          *ngSwitchCase="'slider'"
          [id]="property.id"
          [label]="property.label"
          [value]="getSliderValue()"
          [min]="getSliderMin()"
          [max]="getSliderMax()"
          [step]="getSliderStep()"
          [showInput]="getSliderShowInput()"
          [disabled]="property.disabled || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-slider>

        <!-- Toggle -->
        <ui-toggle
          *ngSwitchCase="'toggle'"
          [label]="property.label"
          [value]="getToggleValue()"
          [disabled]="property.disabled || readonly"
          (valueChange)="onValueChange($event)"
        ></ui-toggle>

        <!-- Readonly -->
        <div *ngSwitchCase="'readonly'" class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-text-shaded">{{
            property.label
          }}</label>
          <div
            class="rounded border border-elevation-border bg-elevation-level-1 px-3 py-2 text-sm text-text-shaded"
          >
            {{ property.value }}
          </div>
        </div>

        <!-- Fallback for unknown type -->
        <div *ngSwitchDefault class="text-sm text-danger-default">
          Unknown property type: {{ property.type }}
        </div>
      </ng-container>
    </div>
  `,
})
export class PropertyItemComponent {
  @Input() property!: PropertyItem;
  @Input() readonly: boolean = false;

  @Output() valueChange = new EventEmitter<{ id: string; value: any }>();

  isTextProperty(): boolean {
    return this.property.type === 'text';
  }

  isNumberProperty(): boolean {
    return this.property.type === 'number';
  }

  isColorProperty(): boolean {
    return this.property.type === 'color';
  }

  isDateProperty(): boolean {
    return this.property.type === 'date';
  }

  isSelectProperty(): boolean {
    return this.property.type === 'select';
  }

  isSliderProperty(): boolean {
    return this.property.type === 'slider';
  }

  isToggleProperty(): boolean {
    return this.property.type === 'toggle';
  }

  getTextValue(): string {
    return this.isTextProperty() ? (this.property as TextProperty).value : '';
  }

  getTextPlaceholder(): string {
    return this.isTextProperty()
      ? (this.property as TextProperty).placeholder || ''
      : '';
  }

  getNumberValue(): number {
    return this.isNumberProperty()
      ? (this.property as NumberProperty).value
      : 0;
  }

  getColorValue(): string {
    return this.isColorProperty()
      ? (this.property as ColorProperty).value
      : '#000000';
  }

  getDateValue(): string {
    return this.isDateProperty() ? (this.property as DateProperty).value : '';
  }

  getSelectValue(): string | number {
    return this.isSelectProperty()
      ? (this.property as SelectProperty).value
      : '';
  }

  getSelectOptions(): any[] {
    return this.isSelectProperty()
      ? (this.property as SelectProperty).options
      : [];
  }

  getSliderValue(): number {
    return this.isSliderProperty()
      ? (this.property as SliderProperty).value
      : 0;
  }

  getSliderMin(): number {
    return this.isSliderProperty() ? (this.property as SliderProperty).min : 0;
  }

  getSliderMax(): number {
    return this.isSliderProperty()
      ? (this.property as SliderProperty).max
      : 100;
  }

  getSliderStep(): number {
    return this.isSliderProperty()
      ? (this.property as SliderProperty).step || 1
      : 1;
  }

  getSliderShowInput(): boolean {
    return this.isSliderProperty()
      ? (this.property as SliderProperty).showInput || false
      : false;
  }

  getToggleValue(): boolean {
    return this.isToggleProperty()
      ? (this.property as ToggleProperty).value
      : false;
  }

  onValueChange(value: any): void {
    this.valueChange.emit({
      id: this.property.id,
      value,
    });
  }
}
