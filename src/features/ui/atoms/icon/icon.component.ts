import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { IconService } from './icon.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      fill="currentColor"
      [ngClass]="customClass"
      aria-hidden="true"
    >
      <use [attr.xlink:href]="iconLink"></use>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      svg {
        display: block; /* Предотвращает дополнительное пространство под inline-flex svg */
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true, // Делаем компонент автономным для простоты
  imports: [NgClass],
})
export class IconComponent implements OnInit {
  @Input({ required: true }) name!: string; // Идентификатор иконки из спрайта
  @Input() size: string | number = 16;
  @Input() customClass: string = '';

  private iconService = inject(IconService);

  ngOnInit(): void {
    // Сервис позаботится о том, чтобы спрайт был загружен.
    // Вызов ensureSpriteLoaded() здесь гарантирует, что попытка загрузки спрайта
    // произойдет при инициализации хотя бы одного компонента иконки.
    this.iconService.ensureSpriteLoaded().subscribe();
  }

  get iconLink(): string {
    // Сервис загружает спрайт в DOM.
    // Атрибут href тега <use> будет указывать на ID внутри спрайта в документе.
    return `#${this.name}`;
  }
}
