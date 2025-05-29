import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarPanelComponent } from '../../components/sidebar-panel/sidebar-panel.component';
import { PropSidebarService } from '../../services/prop-sidebar.service';
import { SidebarPanelConfig } from '../../types/prop-sidebar.types';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-json';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarPanelComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex h-full">
      <!-- Main Content -->
      <section
        class="flex-1 flex flex-col gap-6 bg-zinc-50 p-6 h-full max-h-[calc(100vh-40px)] overflow-hidden"
      >
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold text-gray-800">
            Демонстрация панели свойств
          </h1>
          <p class="text-gray-600 pt-2 pb-6">
            Панель свойств генерируется динамически из JSON конфигурации.
          </p>
          <button
            (click)="loadExampleConfig()"
            class="rounded w-fit bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600 hover:cursor-pointer"
          >
            Загрузить конфигурацию
          </button>
        </div>

        <div class="h-full flex flex-col gap-3 pb-2">
          <h2 class="text-xl font-semibold text-gray-800">
            Текущие значения свойств:
          </h2>
          <div
            *ngIf="config"
            class="code-container bg-[#272822] rounded-lg h-[calc(85%-40px)] overflow-y-auto"
          >
            <pre
              class="p-4 text-white"
            ><code [innerHTML]="getCustomFormattedProperties()"></code></pre>
          </div>
        </div>
      </section>

      <!-- Sidebar -->
      <div *ngIf="config" class="w-96 border-l border-gray-200">
        <app-sidebar-panel
          [config]="config"
          (propertyChange)="onPropertyChange($event)"
          (close)="closePanel()"
        ></app-sidebar-panel>
      </div>
    </div>
  `,
  styles: [
    `
      pre {
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0;
        overflow: auto;
      }

      code {
        font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
        white-space: pre;
      }

      .json-string {
        color: #9ce57a;
      }

      .json-number {
        color: #b5cea8;
      }

      .json-boolean {
        color: #569cd6;
      }

      .json-null {
        color: #569cd6;
      }

      .json-key {
        color: #f07178;
      }

      .json-punctuation {
        color: #d4d4d4;
      }
    `,
  ],
})
export class DemoPageComponent implements OnInit, AfterViewInit {
  config: SidebarPanelConfig | null = null;

  constructor(private propSidebarService: PropSidebarService) {}

  ngOnInit(): void {
    // Subscribe to config changes
    this.propSidebarService.config$.subscribe((config) => {
      this.config = config;
    });
  }

  ngAfterViewInit(): void {
    // Инициализируем при загрузке компонента
  }

  highlightCode(): void {
    if (this.config) {
      Prism.highlightAll();
    }
  }

  loadExampleConfig(): void {
    // Загружаем данные напрямую из локального JSON файла
    this.loadHardcodedConfig();
  }

  loadHardcodedConfig(): void {
    // Загружаем JSON напрямую из импортированного файла
    import('../../data/example-panel.json')
      .then((data) => {
        this.config = this.propSidebarService.loadFromJson(data.default);
        console.log('Конфигурация успешно загружена', this.config);
      })
      .catch((err) => {
        console.error('Ошибка загрузки конфигурации:', err);
      });
  }

  onPropertyChange(event: { id: string; value: any }): void {
    console.log('Свойство изменено:', event);

    // Обновляем свойство в сервисе
    this.propSidebarService.updatePropertyValue(event.id, event.value);
  }

  closePanel(): void {
    this.config = null;
    this.propSidebarService.reset();
  }

  getFormattedProperties(): string {
    if (!this.config) return '';

    const properties: Record<string, any> = {};

    // Извлекаем все свойства из всех групп
    this.config.groups.forEach((group) => {
      group.properties.forEach((prop) => {
        properties[prop.id] = prop.value;
      });
    });

    return JSON.stringify(properties, null, 2);
  }

  getCustomFormattedProperties(): string {
    if (!this.config) return '';

    // Получаем JSON строку из всего конфига
    const jsonString = JSON.stringify(this.config, null, 2);

    // Форматируем строку с HTML-тегами для подсветки синтаксиса
    return this.formatJsonWithHtml(jsonString);
  }

  formatJsonWithHtml(json: string): string {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'json-number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'json-key';
              match = match.replace(
                /"/g,
                '<span class="json-punctuation">"</span>'
              );
              match = match.replace(
                /:/g,
                '<span class="json-punctuation">:</span>'
              );
              return `<span class="${cls}">${match}</span>`;
            } else {
              cls = 'json-string';
              match = match.replace(
                /"/g,
                '<span class="json-punctuation">"</span>'
              );
              return `<span class="${cls}">${match}</span>`;
            }
          } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
          } else if (/null/.test(match)) {
            cls = 'json-null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      )
      .replace(/[{}[\],]/g, (match) => {
        return `<span class="json-punctuation">${match}</span>`;
      });
  }
}
