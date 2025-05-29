import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)"
      [type]="type"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const baseClasses =
      'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary:
        'bg-primary-default text-text-white hover:bg-primary-invert focus:ring-primary-default',
      secondary:
        'bg-secondary-default text-text-default hover:bg-secondary-dark focus:ring-secondary-dark',
      outline:
        'border border-elevation-border bg-elevation-level-0 text-text-shaded hover:bg-elevation-level-1 focus:ring-primary-default',
      text: 'bg-transparent text-primary-default hover:bg-elevation-level-1 focus:ring-primary-default',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const disabledClasses = this.disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    return `${baseClasses} ${variantClasses[this.variant]} ${
      sizeClasses[this.size]
    } ${disabledClasses}`;
  }
}
