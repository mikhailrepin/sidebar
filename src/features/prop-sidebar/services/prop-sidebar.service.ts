import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SidebarPanelConfig,
  PropertyGroup,
  PropertyItem,
} from '../types/prop-sidebar.types';

@Injectable({
  providedIn: 'root',
})
export class PropSidebarService {
  private configSubject = new BehaviorSubject<SidebarPanelConfig | null>(null);

  // Public observable for config changes
  public config$ = this.configSubject.asObservable();

  constructor() {}

  /**
   * Load panel configuration from JSON data
   * @param jsonData The panel configuration data
   */
  loadFromJson(jsonData: any): SidebarPanelConfig {
    try {
      // Validate and transform the data if needed
      const config: SidebarPanelConfig = this.validateConfig(jsonData);

      // Update the config subject
      this.configSubject.next(config);

      return config;
    } catch (error) {
      console.error('Error loading panel configuration:', error);
      throw error;
    }
  }

  /**
   * Validate and transform the configuration data
   * @param data The raw data to validate
   * @returns The validated and transformed SidebarPanelConfig
   */
  private validateConfig(data: any): SidebarPanelConfig {
    // Check if the data has the required fields
    if (!data.id || !data.title || !Array.isArray(data.groups)) {
      throw new Error('Invalid panel configuration: missing required fields');
    }

    // Process and validate groups
    const groups: PropertyGroup[] = data.groups.map((groupData: any) => {
      if (
        !groupData.id ||
        !groupData.title ||
        !Array.isArray(groupData.properties)
      ) {
        throw new Error(
          `Invalid group configuration: ${JSON.stringify(groupData)}`
        );
      }

      // Process and validate properties
      const properties: PropertyItem[] = groupData.properties.map(
        (propData: any) => {
          if (!propData.id || !propData.label || !propData.type) {
            throw new Error(
              `Invalid property configuration: ${JSON.stringify(propData)}`
            );
          }

          // Ensure the property has the correct structure based on its type
          return this.validateProperty(propData);
        }
      );

      return {
        id: groupData.id,
        title: groupData.title,
        expanded: groupData.expanded !== undefined ? groupData.expanded : true,
        readonly: groupData.readonly || false,
        properties,
      };
    });

    return {
      id: data.id,
      title: data.title,
      groups,
    };
  }

  /**
   * Validate and transform a property based on its type
   * @param propData The property data to validate
   * @returns The validated PropertyItem
   */
  private validateProperty(propData: any): PropertyItem {
    const baseProperty = {
      id: propData.id,
      label: propData.label,
      type: propData.type,
      disabled: propData.disabled || false,
      readonly: propData.readonly || false,
    };

    switch (propData.type) {
      case 'text':
        return {
          ...baseProperty,
          type: 'text',
          value: propData.value || '',
          placeholder: propData.placeholder,
        };

      case 'number':
        return {
          ...baseProperty,
          type: 'number',
          value: typeof propData.value === 'number' ? propData.value : 0,
          min: propData.min,
          max: propData.max,
          step: propData.step,
          showButtons: propData.showButtons,
        };

      case 'color':
        return {
          ...baseProperty,
          type: 'color',
          value: propData.value || '#000000',
        };

      case 'date':
        return {
          ...baseProperty,
          type: 'date',
          value: propData.value || '',
        };

      case 'select':
        if (!Array.isArray(propData.options)) {
          throw new Error(
            `Select property ${propData.id} must have options array`
          );
        }
        return {
          ...baseProperty,
          type: 'select',
          value: propData.value || '',
          options: propData.options,
        };

      case 'slider':
        if (
          typeof propData.min !== 'number' ||
          typeof propData.max !== 'number'
        ) {
          throw new Error(
            `Slider property ${propData.id} must have min and max values`
          );
        }
        return {
          ...baseProperty,
          type: 'slider',
          value:
            typeof propData.value === 'number'
              ? propData.value
              : propData.min || 0,
          min: propData.min,
          max: propData.max,
          step: propData.step || 1,
          showInput: propData.showInput || false,
        };

      case 'toggle':
        return {
          ...baseProperty,
          type: 'toggle',
          value: propData.value === true,
        };

      case 'readonly':
        return {
          ...baseProperty,
          type: 'readonly',
          value: propData.value || '',
        };

      default:
        throw new Error(`Unknown property type: ${propData.type}`);
    }
  }

  /**
   * Update a property value in the current configuration
   * @param propertyId The ID of the property to update
   * @param value The new value for the property
   */
  updatePropertyValue(propertyId: string, value: any): void {
    const currentConfig = this.configSubject.value;
    if (!currentConfig) return;

    let updated = false;

    const updatedGroups = currentConfig.groups.map((group) => {
      const updatedProperties = group.properties.map((prop) => {
        if (prop.id === propertyId) {
          updated = true;
          return { ...prop, value };
        }
        return prop;
      });

      return {
        ...group,
        properties: updatedProperties,
      };
    });

    if (updated) {
      this.configSubject.next({
        ...currentConfig,
        groups: updatedGroups,
      });
    }
  }

  /**
   * Get the current panel configuration
   */
  getCurrentConfig(): SidebarPanelConfig | null {
    return this.configSubject.value;
  }

  /**
   * Reset the panel configuration
   */
  reset(): void {
    this.configSubject.next(null);
  }
}
