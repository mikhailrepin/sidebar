import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyGroup } from '../../types/prop-sidebar.types';
import { PropertyItemComponent } from '../property-item/property-item.component';

@Component({
  selector: 'app-property-group',
  standalone: true,
  imports: [CommonModule, PropertyItemComponent],
  template: `
    <div
      class="mb-2 rounded-md border border-elevation-border bg-elevation-level-2"
    >
      <div
        class="flex gap-2 items-center justify-between bg-secondary-default px-2 py-2"
        [class.cursor-pointer]="isAccordion()"
        [ngClass]="{
          'rounded-t-md border-b border-elevation-border':
            isAccordion() && isExpanded,
          'rounded-md': !isAccordion() || !isExpanded
        }"
        (click)="toggleExpanded()"
      >
        <div class="flex items-center">
          <button
            *ngIf="showEditButton"
            (click)="onEditClick($event)"
            class="mr-2 rounded-md p-1 text-text-default hover:bg-elevation-level-2 hover:text-text-default"
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
            *ngIf="isAccordion()"
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
          <div *ngIf="!isAccordion()" class="h-5 w-5"></div>
        </div>
        <h3 class="text-sm font-medium text-text-default w-full">
          {{ group.title }}
        </h3>
      </div>
      <div
        *ngIf="!isAccordion() || isExpanded"
        class="flex flex-col gap-2 p-4"
        [class.pt-0]="!isAccordion()"
      >
        <ng-container *ngFor="let property of group.properties">
          <app-property-item
            [property]="property"
            [readonly]="group.readonly || false"
            (valueChange)="onPropertyChange($event)"
          ></app-property-item>
        </ng-container>
        <!-- Render nested groups -->
        <ng-container *ngFor="let subGroup of group.groups">
          <app-property-group
            [group]="subGroup"
            [showEditButton]="showEditButton"
            (propertyChange)="onPropertyChange($event)"
          ></app-property-group>
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
    if (this.isAccordion()) {
      if (this.group.expanded !== undefined) {
        this.isExpanded = this.group.expanded;
      }
    } else {
      this.isExpanded = true;
    }
  }

  isAccordion(): boolean {
    return this.group.accordion !== false;
  }

  toggleExpanded(): void {
    if (this.isAccordion()) {
      this.isExpanded = !this.isExpanded;
    }
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onPropertyChange(event: { id: string; value: any }): void {
    this.propertyChange.emit(event);
  }
}
