import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarPanelComponent } from '../../components/sidebar-panel/sidebar-panel.component';
import { PropSidebarService } from '../../services/prop-sidebar.service';
import { SidebarPanelConfig } from '../../types/prop-sidebar.types';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-json';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarPanelComponent, FormsModule],
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
            Панель свойств генерируется динамически из JSON конфигурации. Ниже
            вы можете редактировать JSON и применять изменения.
          </p>
          <div class="flex gap-4 mb-4">
            <button
              (click)="loadExampleIntoTextareaAndApply()"
              class="rounded w-fit bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-600 hover:cursor-pointer"
            >
              Загрузить пример
            </button>
            <button
              (click)="applyJsonFromTextarea()"
              class="rounded w-fit bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600 hover:cursor-pointer"
            >
              Применить конфигурацию
            </button>
          </div>
        </div>

        <div class="flex flex-row gap-6 h-[calc(100%-160px)]">
          <!-- JSON Editor -->
          <div class="flex-1 flex flex-col gap-3 pb-2">
            <h2 class="text-xl font-semibold text-gray-800">
              Редактор конфигурации JSON:
            </h2>
            <textarea
              [(ngModel)]="jsonEditText"
              class="w-full h-full p-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
              spellcheck="false"
            ></textarea>
          </div>

          <!-- JSON Preview -->
          <div class="flex-1 flex flex-col gap-3 pb-2">
            <h2 class="text-xl font-semibold text-gray-800">
              Текущая конфигурация панели (просмотр):
            </h2>
            <div
              *ngIf="config"
              class="code-container bg-[#272822] rounded-lg h-full overflow-y-auto"
            >
              <pre
                class="p-4 text-white"
              ><code [innerHTML]="getCustomFormattedProperties()"></code></pre>
            </div>
            <div
              *ngIf="!config"
              class="code-container bg-gray-100 rounded-lg h-full overflow-y-auto p-4 text-gray-500"
            >
              Конфигурация не загружена.
            </div>
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
  jsonEditText: string = '';
  private readonly localStorageKey = 'sidebarConfigJson';

  constructor(private propSidebarService: PropSidebarService) {}

  ngOnInit(): void {
    this.propSidebarService.config$.subscribe((config) => {
      this.config = config;
      if (this.config) {
        const serviceConfigJson = JSON.stringify(this.config, null, 2);
        if (this.jsonEditText !== serviceConfigJson) {
          this.jsonEditText = serviceConfigJson;
        }
      }
      this.highlightCode();
    });

    const savedJsonString = localStorage.getItem(this.localStorageKey);
    if (savedJsonString) {
      this.jsonEditText = savedJsonString;
      this.applyJsonFromTextarea(false);
    } else {
      this.loadExampleIntoTextareaAndApply();
    }
  }

  ngAfterViewInit(): void {
    this.highlightCode();
  }

  highlightCode(): void {
    if (this.config && typeof Prism !== 'undefined' && Prism.highlightAll) {
      setTimeout(() => {
        try {
          Prism.highlightAll();
        } catch (e: any) {
          console.warn('Prism.highlightAll() failed', e);
        }
      }, 0);
    }
  }

  async loadExampleIntoTextareaAndApply(): Promise<void> {
    try {
      const data = await import('../../data/example-panel.json');
      this.jsonEditText = JSON.stringify(data.default, null, 2);
      this.applyJsonFromTextarea();
    } catch (err: any) {
      console.error('Ошибка загрузки примера конфигурации:', err);
      this.jsonEditText = JSON.stringify(
        {
          error: 'Не удалось загрузить пример конфигурации',
          details: err.message,
        },
        null,
        2
      );
      this.applyJsonFromTextarea(false);
    }
  }

  applyJsonFromTextarea(saveToLocalStorage: boolean = true): void {
    try {
      const parsedConfig = JSON.parse(this.jsonEditText);
      this.propSidebarService.loadFromJson(parsedConfig);

      if (this.config) {
        const canonicalJsonString = JSON.stringify(this.config, null, 2);
        this.jsonEditText = canonicalJsonString;

        if (saveToLocalStorage) {
          localStorage.setItem(this.localStorageKey, canonicalJsonString);
          console.log(
            'Конфигурация успешно применена и сохранена в localStorage.'
          );
        } else {
          console.log('Конфигурация успешно применена.');
        }
      } else {
        console.warn('Конфигурация привела к null значению this.config');
        if (saveToLocalStorage) {
          localStorage.removeItem(this.localStorageKey);
        }
      }
    } catch (error: any) {
      console.error('Ошибка парсинга JSON из редактора:', error);
      alert(
        'Ошибка в JSON конфигурации: ' +
          error.message +
          '. Проверьте консоль для деталей.'
      );
    }
    this.highlightCode();
  }

  onPropertyChange(event: { id: string; value: any }): void {
    console.log('Свойство изменено из панели:', event);
    this.propSidebarService.updatePropertyValue(event.id, event.value);
  }

  closePanel(): void {
    this.propSidebarService.reset();
    localStorage.removeItem(this.localStorageKey);
    this.jsonEditText = '';
    console.log(
      'Панель закрыта, конфигурация сброшена и удалена из localStorage.'
    );
  }

  getCustomFormattedProperties(): string {
    if (!this.config) {
      return '';
    }
    const jsonString = JSON.stringify(this.config, null, 2);
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
