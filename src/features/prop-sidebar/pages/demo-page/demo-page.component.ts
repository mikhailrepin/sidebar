import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SidebarPanelComponent } from '../../components/sidebar-panel/sidebar-panel.component';
import { PropSidebarService } from '../../services/prop-sidebar.service';
import { SidebarPanelConfig } from '../../types/prop-sidebar.types';

@Component({
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarPanelComponent],
  template: `
    <div class="flex h-screen">
      <!-- Main Content -->
      <div class="flex-1 bg-gray-100 p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            Демонстрация панели свойств
          </h1>
          <p class="mt-2 text-gray-600">
            Панель свойств генерируется динамически из JSON конфигурации.
          </p>
        </div>

        <div class="mt-6">
          <button
            (click)="loadExampleConfig()"
            class="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Загрузить пример конфигурации
          </button>
        </div>

        <div class="mt-6">
          <h2 class="text-xl font-semibold text-gray-800">
            Текущие значения свойств:
          </h2>
          <pre
            *ngIf="config"
            class="mt-4 rounded bg-gray-800 p-4 text-sm text-white"
            >{{ getFormattedProperties() }}</pre
          >
        </div>
      </div>

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
})
export class DemoPageComponent implements OnInit {
  config: SidebarPanelConfig | null = null;

  constructor(
    private propSidebarService: PropSidebarService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to config changes
    this.propSidebarService.config$.subscribe((config) => {
      this.config = config;
    });
  }

  loadExampleConfig(): void {
    // Load the example configuration from the JSON file
    this.http.get<any>('assets/data/example-panel.json').subscribe({
      next: (data) => {
        try {
          this.config = this.propSidebarService.loadFromJson(data);
          console.log('Configuration loaded successfully', this.config);
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
      })
      .catch((err) => {
        console.error('Error loading hardcoded configuration:', err);
      });
  }

  onPropertyChange(event: { id: string; value: any }): void {
    console.log('Property changed:', event);

    // Update the property in the service
    this.propSidebarService.updatePropertyValue(event.id, event.value);
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
