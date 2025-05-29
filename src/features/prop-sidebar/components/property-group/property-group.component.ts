import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyGroup } from '../../types/prop-sidebar.types';
import { PropertyItemComponent } from '../property-item/property-item.component';

@Component({
  selector: 'app-property-group',
  standalone: true,
  imports: [CommonModule, PropertyItemComponent],
  template: `
    <div class="mb-2 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        class="flex cursor-pointer items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-2"
        (click)="toggleExpanded()"
      >
        <h3 class="text-sm font-medium text-gray-700">{{ group.title }}</h3>
        <div class="flex items-center">
          <button
            *ngIf="showEditButton"
            (click)="onEditClick($event)"
            class="mr-2 rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
          </button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transform transition-transform duration-200"
            [ngClass]="{ 'rotate-180': !isExpanded }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div *ngIf="isExpanded" class="p-4">
        <ng-container *ngFor="let property of group.properties">
          <app-property-item
            [property]="property"
            [readonly]="group.readonly || false"
            (valueChange)="onPropertyChange($event)"
          ></app-property-item>
        </ng-container>
      </div>
    </div>
  `,
})
export class PropertyGroupComponent {
  @Input() group!: PropertyGroup;
  @Input() showEditButton: boolean = false;

  @Output() propertyChange = new EventEmitter<{ id: string; value: any }>();

  isExpanded: boolean = true;

  ngOnInit() {
    // Set initial expanded state from input if available
    if (this.group.expanded !== undefined) {
      this.isExpanded = this.group.expanded;
    }
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onEditClick(event: MouseEvent): void {
    // Stop event propagation to prevent the group from toggling
    event.stopPropagation();
    // Additional logic for handling edit click
  }

  onPropertyChange(event: { id: string; value: any }): void {
    // Pass the property change event up to parent component
    this.propertyChange.emit(event);
  }
}
