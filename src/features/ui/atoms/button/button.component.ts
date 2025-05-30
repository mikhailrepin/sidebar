import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-button',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
  styles: [
    `
      @import '../../../../styles.css';
      .btn {
        @apply rounded-md font-normal transition-all duration-150 ease-in-out outline-none flex items-center justify-center select-none border border-transparent;
        &:active {
          @apply transform scale-98;
        }
        &.big {
          @apply px-3 h-10 min-w-10 text-lg;
        }
        &.default {
          @apply px-2 h-8 min-w-8 text-sm;
        }
        &.small {
          @apply p-1 h-6 min-w-6 text-sm;
        }
        &.primary {
          &.fill {
            @apply bg-primary-default text-primary-contrasted;
          }
          &.outline {
            @apply border-primary-default text-primary-default;
            &:hover {
              @apply bg-primary-shaded-100;
            }
          }
          &.ghost {
            @apply text-primary-default;
            &:hover {
              @apply bg-primary-shaded-100;
            }
          }
        }
        &.secondary {
          &.fill {
            @apply bg-secondary-default text-text-default;
          }
          &.outline {
            @apply border-elevation-border text-text-default;
            &:hover {
              @apply bg-secondary-default;
            }
          }
          &.ghost {
            @apply text-secondary-default;
            &:hover {
              @apply bg-secondary-default;
            }
          }
        }
        &:hover {
          @apply filter brightness-90 cursor-pointer;
        }
        &.disabled {
          @apply !bg-secondary-dark !text-text-disabled pointer-events-none;
        }
      }
    `,
  ],
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
    let klasses = 'btn';
    klasses += ` ${this.variant}`;
    klasses += ` ${this.buttonStyle}`;
    klasses += ` ${this.size}`;
    if (this.disabled) {
      klasses += ' disabled';
    }
    return klasses;
  }
}
