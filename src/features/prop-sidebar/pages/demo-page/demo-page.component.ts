import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
              class="language-json p-0 w-full"
            ><code class="language-json">{{ getFormattedProperties() }}</code></pre>
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
      }

      code {
        font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
        white-space: pre-wrap;
        word-break: break-all;
      }
    `,
  ],
})
export class DemoPageComponent implements OnInit, AfterViewInit {
  config: SidebarPanelConfig | null = null;

  constructor(
    private propSidebarService: PropSidebarService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to config changes
    this.propSidebarService.config$.subscribe((config) => {
      this.config = config;
      // После обновления конфигурации, запускаем подсветку синтаксиса снова
      setTimeout(() => {
        this.highlightCode();
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    // Инициализируем подсветку синтаксиса при загрузке компонента
    this.highlightCode();
  }

  highlightCode(): void {
    if (this.config) {
      Prism.highlightAll();
    }
  }

  loadExampleConfig(): void {
    // Load the example configuration from the JSON file
    this.http.get<any>('assets/data/example-panel.json').subscribe({
      next: (data) => {
        try {
          this.config = this.propSidebarService.loadFromJson(data);
          console.log('Configuration loaded successfully', this.config);
          setTimeout(() => {
            this.highlightCode();
          }, 0);
        } catch (error) {
          console.error('Error loading configuration:', error);
        }
      },
      error: (err) => {
        console.error('Error fetching configuration file:', err);

        // Fallback: Load directly from assets in development
        this.loadHardcodedConfig();
      },
    });
  }

  loadHardcodedConfig(): void {
    // For development/demo purposes, load the JSON directly from the imported file
    import('../../data/example-panel.json')
      .then((data) => {
        this.config = this.propSidebarService.loadFromJson(data.default);
        console.log('Hardcoded configuration loaded successfully', this.config);
        setTimeout(() => {
          this.highlightCode();
        }, 0);
      })
      .catch((err) => {
        console.error('Error loading hardcoded configuration:', err);
      });
  }

  onPropertyChange(event: { id: string; value: any }): void {
    console.log('Property changed:', event);

    // Update the property in the service
    this.propSidebarService.updatePropertyValue(event.id, event.value);

    // Обновляем подсветку синтаксиса при изменении свойств
    setTimeout(() => {
      this.highlightCode();
    }, 0);
  }

  closePanel(): void {
    this.config = null;
    this.propSidebarService.reset();
  }

  getFormattedProperties(): string {
    if (!this.config) return '';

    const properties: Record<string, any> = {};

    // Extract all properties from all groups
    this.config.groups.forEach((group) => {
      group.properties.forEach((prop) => {
        properties[prop.id] = prop.value;
      });
    });

    return JSON.stringify(properties, null, 2);
  }
}
