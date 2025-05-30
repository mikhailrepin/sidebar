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
    if (!data.id || !data.title || !Array.isArray(data.groups)) {
      throw new Error('Invalid panel configuration: missing required fields');
    }

    return {
      id: data.id,
      title: data.title,
      icon: data.icon,
      groups: this.processGroups(data.groups),
      minWidth: data.minWidth,
      maxWidth: data.maxWidth,
    };
  }

  private processGroups(groupDataArray: any[]): PropertyGroup[] {
    return groupDataArray.map((groupData: any) => {
      if (!groupData.id || !groupData.title) {
        throw new Error(
          `Invalid group configuration: missing id or title in ${JSON.stringify(
            groupData
          )}`
        );
      }

      const properties: PropertyItem[] = groupData.properties
        ? groupData.properties.map((propData: any) => {
            if (!propData.id || !propData.label || !propData.type) {
              throw new Error(
                `Invalid property configuration: ${JSON.stringify(propData)}`
              );
            }
            return this.validateProperty(propData);
          })
        : [];

      const nestedGroups: PropertyGroup[] | undefined = groupData.groups
        ? this.processGroups(groupData.groups)
        : undefined;

      return {
        id: groupData.id,
        title: groupData.title,
        expanded: groupData.expanded !== undefined ? groupData.expanded : true,
        readonly: groupData.readonly || false,
        edit: groupData.edit,
        accordion:
          groupData.accordion === undefined ? true : groupData.accordion,
        properties,
        groups: nestedGroups,
      };
    });
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

    const updateGroupsRecursively = (
      groups: PropertyGroup[]
    ): PropertyGroup[] => {
      return groups.map((group) => {
        let groupUpdated = false;
        const updatedProperties = group.properties.map((prop) => {
          if (prop.id === propertyId) {
            groupUpdated = true;
            return { ...prop, value };
          }
          return prop;
        });

        let updatedNestedGroups = group.groups;
        if (group.groups && group.groups.length > 0) {
          const nestedResult = updateGroupsRecursively(group.groups);
          if (nestedResult !== group.groups) {
            updatedNestedGroups = nestedResult;
            groupUpdated = true;
          }
        }

        if (groupUpdated) {
          return {
            ...group,
            properties: updatedProperties,
            groups: updatedNestedGroups,
          };
        }
        return group;
      });
    };

    const updatedConfigGroups = updateGroupsRecursively(currentConfig.groups);

    if (updatedConfigGroups !== currentConfig.groups) {
      this.configSubject.next({
        ...currentConfig,
        groups: updatedConfigGroups,
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
