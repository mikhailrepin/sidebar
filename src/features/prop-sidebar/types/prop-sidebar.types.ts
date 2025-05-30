export type ControlType =
  | 'text'
  | 'number'
  | 'color'
  | 'date'
  | 'select'
  | 'slider'
  | 'toggle'
  | 'readonly';

export type PenStyle = 'solid' | 'dashed' | 'dotted' | 'double';

export interface OptionItem {
  label: string;
  value: string | number;
}

export interface BaseProperty {
  id: string;
  type: ControlType;
  label: string;
  value: any;
  readonly?: boolean;
  disabled?: boolean;
}

export interface TextProperty extends BaseProperty {
  type: 'text';
  value: string;
  placeholder?: string;
}

export interface NumberProperty extends BaseProperty {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  step?: number;
  showButtons?: boolean;
}

export interface ColorProperty extends BaseProperty {
  type: 'color';
  value: string;
}

export interface DateProperty extends BaseProperty {
  type: 'date';
  value: string;
}

export interface SelectProperty extends BaseProperty {
  type: 'select';
  value: string | number;
  options: OptionItem[];
}

export interface SliderProperty extends BaseProperty {
  type: 'slider';
  value: number;
  min: number;
  max: number;
  step?: number;
  showInput?: boolean;
}

export interface ToggleProperty extends BaseProperty {
  type: 'toggle';
  value: boolean;
}

export interface ReadonlyProperty extends BaseProperty {
  type: 'readonly';
  value: string;
}

export type PropertyItem =
  | TextProperty
  | NumberProperty
  | ColorProperty
  | DateProperty
  | SelectProperty
  | SliderProperty
  | ToggleProperty
  | ReadonlyProperty;

export interface PropertyGroup {
  id: string;
  title: string;
  expanded?: boolean;
  readonly?: boolean;
  accordion?: boolean;
  properties: PropertyItem[];
  groups?: PropertyGroup[];
}

export interface SidebarPanelConfig {
  id: string;
  title: string;
  groups: PropertyGroup[];
  minWidth?: number;
  maxWidth?: number;
}
