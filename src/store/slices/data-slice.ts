/**
 * Data Slice - Manages the content, root, and zones data
 * Part of the modular slice architecture
 */

import type {ComponentData, Data, RootData} from "../../types";
import {rootDroppableId} from "../../lib/root-droppable-id";
import {generateId} from "../../lib/generate-id";

// =============================================================================
// Types
// =============================================================================

export type DataSliceState = {
  content: ComponentData[];
  root: RootData;
  zones: Record<string, ComponentData[]>;
};

export type DataSlice = DataSliceState & {
  /** Get the raw data object */
  getData: () => Data;
  
  /** Set the entire data object */
  setData: (data: Partial<Data>) => void;
  
  /** Update data using a function */
  updateData: (updater: (data: Data) => Partial<Data>) => void;
  
  /** Add a component to a zone */
  addComponent: (component: ComponentData, zone?: string, index?: number) => void;
  
  /** Remove a component by ID */
  removeComponent: (componentId: string) => void;
  
  /** Update a component's data */
  updateComponent: (componentId: string, data: Partial<ComponentData>) => void;
  
  /** Move a component to a new position */
  moveComponent: (
    sourceId: string,
    destinationZone: string,
    destinationIndex: number
  ) => void;
  
  /** Replace a component with new data */
  replaceComponent: (
    componentId: string,
    newData: ComponentData,
    zone?: string,
    index?: number
  ) => void;
  
  /** Duplicate a component */
  duplicateComponent: (componentId: string) => string | null;
  
  /** Get a component by ID */
  getComponent: (componentId: string) => ComponentData | undefined;
  
  /** Get all components in a zone */
  getZoneContent: (zone: string) => ComponentData[];
  
  /** Update root data */
  setRoot: (root: RootData) => void;
  
  /** Register a new zone */
  registerZone: (zone: string) => void;
  
  /** Unregister a zone */
  unregisterZone: (zone: string) => void;
  
  /** Get all zone IDs */
  getZoneIds: () => string[];
};

// =============================================================================
// Default State
// =============================================================================

export const defaultDataState: DataSliceState = {
  content: [],
  root: { props: {} },
  zones: {},
};

// =============================================================================
// Slice Factory
// =============================================================================

export function createDataSlice(
  set: (newState: Partial<DataSlice>) => void,
  get: () => DataSlice
): DataSlice {
  return {
    ...defaultDataState,
    
    getData: () => {
      const state = get();
      return {
        content: state.content,
        root: state.root,
        zones: state.zones,
      };
    },
    
    setData: (data) => {
      set((state) => ({
        content: data.content ?? state.content,
        root: data.root ?? state.root,
        zones: data.zones ?? state.zones,
      }));
    },
    
    updateData: (updater) => {
      const currentData = get().getData();
      const newData = updater(currentData);
      get().setData(newData);
    },
    
    addComponent: (component, zone = rootDroppableId, index) => {
      set((state) => {
        const newContent = [...state.content];
        const newZones = { ...state.zones };
        
        if (zone === rootDroppableId) {
          if (index !== undefined && index >= 0) {
            newContent.splice(index, 0, component);
          } else {
            newContent.push(component);
          }
        } else {
          const zoneContent = [...(newZones[zone] || [])];
          if (index !== undefined && index >= 0) {
            zoneContent.splice(index, 0, component);
          } else {
            zoneContent.push(component);
          }
          newZones[zone] = zoneContent;
        }
        
        return {
          content: newContent,
          zones: newZones,
        };
      });
    },
    
    removeComponent: (componentId) => {
      set((state) => {
        const newContent = state.content.filter(
          (item) => item.props.id !== componentId
        );
        
        const newZones: Record<string, ComponentData[]> = {};
        for (const [zone, items] of Object.entries(state.zones)) {
          newZones[zone] = items.filter((item) => item.props.id !== componentId);
        }
        
        return {
          content: newContent,
          zones: newZones,
        };
      });
    },
    
    updateComponent: (componentId, data) => {
      set((state) => {
        const newContent = state.content.map((item) =>
          item.props.id === componentId ? { ...item, ...data } : item
        );
        
        const newZones: Record<string, ComponentData[]> = {};
        for (const [zone, items] of Object.entries(state.zones)) {
          newZones[zone] = items.map((item) =>
            item.props.id === componentId ? { ...item, ...data } : item
          );
        }
        
        return {
          content: newContent,
          zones: newZones,
        };
      });
    },
    
    moveComponent: (sourceId, destinationZone, destinationIndex) => {
      set((state) => {
        let sourceItem: ComponentData | undefined;
        let newContent = [...state.content];
        const newZones = { ...state.zones };
        
        // Find and remove from source
        const sourceIndex = newContent.findIndex(
          (item) => item.props.id === sourceId
        );
        if (sourceIndex !== -1) {
          [sourceItem] = newContent.splice(sourceIndex, 1);
        } else {
          // Check zones
          for (const [zone, items] of Object.entries(state.zones)) {
            const idx = items.findIndex((item) => item.props.id === sourceId);
            if (idx !== -1) {
              sourceItem = items[idx];
              newZones[zone] = items.filter((item) => item.props.id !== sourceId);
              break;
            }
          }
        }
        
        if (!sourceItem) return state;
        
        // Add to destination
        if (destinationZone === rootDroppableId) {
          const insertIndex =
            destinationIndex < 0
              ? newContent.length
              : Math.min(destinationIndex, newContent.length);
          newContent.splice(insertIndex, 0, sourceItem);
        } else {
          const zoneContent = [...(newZones[destinationZone] || [])];
          const insertIndex =
            destinationIndex < 0
              ? zoneContent.length
              : Math.min(destinationIndex, zoneContent.length);
          zoneContent.splice(insertIndex, 0, sourceItem);
          newZones[destinationZone] = zoneContent;
        }
        
        return {
          content: newContent,
          zones: newZones,
        };
      });
    },
    
    replaceComponent: (componentId, newData, zone, index) => {
      set((state) => {
        if (zone && index !== undefined) {
          // Replace in specific zone
          const newZones = { ...state.zones };
          const zoneContent = [...(newZones[zone] || [])];
          if (index >= 0 && index < zoneContent.length) {
            zoneContent[index] = newData;
            newZones[zone] = zoneContent;
          }
          return { zones: newZones };
        }
        
        // Replace in content
        const newContent = state.content.map((item) =>
          item.props.id === componentId ? newData : item
        );
        
        // Also check zones
        const newZones: Record<string, ComponentData[]> = {};
        for (const [z, items] of Object.entries(state.zones)) {
          newZones[z] = items.map((item) =>
            item.props.id === componentId ? newData : item
          );
        }
        
        return {
          content: newContent,
          zones: newZones,
        };
      });
    },
    
    duplicateComponent: (componentId) => {
      const state = get();
      const original = state.getComponent(componentId);
      if (!original) return null;
      
      const newId = generateId();
      const duplicated: ComponentData = {
        ...original,
        props: {
          ...original.props,
          id: newId,
        },
      };
      
      // Find position of original
      const originalIndex = state.content.findIndex(
        (item) => item.props.id === componentId
      );
      
      state.addComponent(duplicated, rootDroppableId, originalIndex + 1);
      
      return newId;
    },
    
    getComponent: (componentId) => {
      const state = get();
      
      // Check content
      const inContent = state.content.find(
        (item) => item.props.id === componentId
      );
      if (inContent) return inContent;
      
      // Check zones
      for (const items of Object.values(state.zones)) {
        const inZone = items.find((item) => item.props.id === componentId);
        if (inZone) return inZone;
      }
      
      return undefined;
    },
    
    getZoneContent: (zone) => {
      const state = get();
      if (zone === rootDroppableId) {
        return state.content;
      }
      return state.zones[zone] || [];
    },
    
    setRoot: (root) => {
      set({ root });
    },
    
    registerZone: (zone) => {
      set((state) => ({
        zones: {
          ...state.zones,
          [zone]: state.zones[zone] || [],
        },
      }));
    },
    
    unregisterZone: (zone) => {
      set((state) => {
        const { [zone]: _, ...remaining } = state.zones;
        return { zones: remaining };
      });
    },
    
    getZoneIds: () => {
      const state = get();
      return [rootDroppableId, ...Object.keys(state.zones)];
    },
  };
}
