import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyGroup, PropertyItem } from '../../types/prop-sidebar.types';
import { PropertyItemComponent } from '../property-item/property-item.component';
import { IconComponent } from '../../../ui/atoms/icon/icon.component';

@Component({
  selector: 'app-property-group',
  standalone: true,
  imports: [CommonModule, PropertyItemComponent, IconComponent],
  template: `
    <div
      class=" rounded-md border border-elevation-border bg-elevation-level-2"
    >
      <div
        class="flex items-center justify-between bg-secondary-default px-2 py-2"
        [class.cursor-pointer]="isAccordion()"
        [ngClass]="{
          'rounded-t-md border-b border-elevation-border':
            !isAccordion() || isExpanded,
          'rounded-md': isAccordion() && !isExpanded
        }"
        (click)="toggleExpanded()"
      >
        <!-- accordion icon -->
        <app-icon
          *ngIf="isAccordion()"
          name="chevron-right-small-fill"
          [ngClass]="{
            'transition-transform duration-200': isAccordion(),
            'rotate-90': isExpanded
          }"
        />
        <!-- group title -->
        <h3
          class="px-1 text-sm font-medium text-text-default w-full text-nowrap text-ellipsis overflow-hidden"
        >
          {{ group.title }}
        </h3>
        <!-- group controls -->
        <div class="flex items-center">
          <!-- edit button -->
          <button
            *ngIf="group.readonly && group.edit"
            (click)="onEditClick($event)"
            class="mr-2 rounded-md flex items-center justify-center w-6 h-6 text-text-default hover:bg-elevation-level-2 hover:text-text-default"
          >
            <app-icon name="pencil-edit-active-outline" />
          </button>
          <!-- drag handle -->
        </div>
      </div>
      <div
        class="grid overflow-hidden transition-all duration-300 ease-in-out"
        [ngClass]="{
          'grid-rows-[1fr] opacity-100': !isAccordion() || isExpanded,
          'grid-rows-[0fr] opacity-0': isAccordion() && !isExpanded
        }"
      >
        <div class="overflow-hidden">
          <div class="flex flex-col gap-3 p-3">
            <ng-container
              *ngFor="
                let property of group.properties;
                trackBy: trackByPropertyId
              "
            >
              <app-property-item
                [property]="property"
                [readonly]="group.readonly || false"
                (valueChange)="onPropertyChange($event)"
              ></app-property-item>
            </ng-container>
            <!-- Render nested groups -->
            <ng-container
              *ngFor="let subGroup of group.groups; trackBy: trackByGroupId"
            >
              <app-property-group
                [group]="subGroup"
                (propertyChange)="onPropertyChange($event)"
              ></app-property-group>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PropertyGroupComponent {
  @Input() group!: PropertyGroup;

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

  trackByPropertyId(index: number, property: PropertyItem): string {
    return property.id;
  }

  trackByGroupId(index: number, group: PropertyGroup): string {
    return group.id;
  }
}
