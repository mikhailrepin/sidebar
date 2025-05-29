import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarPanelConfig } from '../../types/prop-sidebar.types';
import { PropertyGroupComponent } from '../property-group/property-group.component';

@Component({
  selector: 'app-sidebar-panel',
  standalone: true,
  imports: [CommonModule, PropertyGroupComponent],
  template: `
    <div class="flex h-full flex-col bg-gray-50">
      <!-- Header -->
      <div
        class="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm"
      >
        <h2 class="text-lg font-medium text-gray-900">{{ config.title }}</h2>
        <div class="flex items-center space-x-2">
          <button
            *ngIf="showCloseButton"
            (click)="onCloseClick()"
            class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search Field -->
      <div class="border-b border-gray-200 px-4 py-2">
        <div class="relative">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <svg
              class="h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            class="block w-full rounded-md border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Поиск свойств..."
            (input)="onSearch($event)"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <ng-container *ngFor="let group of filteredGroups">
          <app-property-group
            [group]="group"
            [showEditButton]="showEditButtons"
            (propertyChange)="onPropertyChange($event)"
          ></app-property-group>
        </ng-container>
      </div>
    </div>
  `,
})
export class SidebarPanelComponent {
  @Input() config!: SidebarPanelConfig;
  @Input() showCloseButton: boolean = true;
  @Input() showEditButtons: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() propertyChange = new EventEmitter<{ id: string; value: any }>();

  filteredGroups = this.config?.groups || [];
  searchQuery: string = '';

  ngOnChanges() {
    this.filteredGroups = this.config?.groups || [];
    this.filterGroups();
  }

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value.toLowerCase();
    this.filterGroups();
  }

  filterGroups() {
    if (!this.searchQuery) {
      this.filteredGroups = this.config.groups;
      return;
    }

    this.filteredGroups = this.config.groups
      .map((group) => {
        const filteredProperties = group.properties.filter(
          (prop) =>
            prop.label.toLowerCase().includes(this.searchQuery) ||
            prop.id.toLowerCase().includes(this.searchQuery)
        );

        if (filteredProperties.length > 0) {
          return {
            ...group,
            properties: filteredProperties,
          };
        }

        return null;
      })
      .filter((group) => group !== null) as typeof this.filteredGroups;
  }

  onCloseClick() {
    this.close.emit();
  }

  onPropertyChange(event: { id: string; value: any }) {
    this.propertyChange.emit(event);
  }
}
