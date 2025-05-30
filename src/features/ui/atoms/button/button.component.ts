import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)"
      [type]="type"
    >
      <app-icon *ngIf="rightIcon" [name]="rightIcon" />
      <span
        class="px-2 max-w-[200px] truncate text-ellipsis whitespace-nowrap text-center text-nowrap"
        *ngIf="label"
        >{{ label }}</span
      >
      <app-icon *ngIf="leftIcon" [name]="leftIcon" />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' =
    'primary';
  @Input() buttonStyle: 'fill' | 'outline' | 'ghost' = 'fill';
  @Input() size: 'big' | 'default' | 'small' = 'default';
  @Input() label: string = '';
  @Input() leftIcon: string = '';
  @Input() rightIcon: string = '';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const baseClasses =
      'rounded-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center select-none border border-transparent';

    const variantClasses = {
      primary:
        'bg-primary-default text-text-white hover:bg-primary-invert focus:ring-primary-default',
      secondary:
        'bg-secondary-default text-text-default hover:bg-secondary-dark focus:ring-secondary-dark',
      success:
        'bg-success-default text-text-white hover:bg-success-light focus:ring-success-default',
      warning:
        'bg-warning-default text-text-white hover:bg-warning-light focus:ring-warning-default',
      danger:
        'bg-danger-default text-text-white hover:bg-danger-light focus:ring-danger-default',
    };

    const sizeClasses = {
      big: 'px-3 h-10 min-w-10 text-lg',
      default: 'px-2 h-8 min-w-8 text-sm',
      small: 'p-1 h-6 min-w-6 text-sm',
    };

    const disabledClasses = this.disabled
      ? 'opacity-50 pointer-events-none'
      : 'cursor-pointer';

    return `${baseClasses} ${variantClasses[this.variant]} ${
      sizeClasses[this.size]
    } ${disabledClasses}`;
  }
}
