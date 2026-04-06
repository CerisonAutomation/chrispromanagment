// =============================================================================
// NESTED DROPPABLE PLUGIN
// Custom collision detection for nested drops
// =============================================================================

import {DragDropManager} from "@dnd-kit/dom";

type NestedDroppablePluginOptions = {
  onChange?: (
    params: { zone: string | null; area: string | null },
    manager: DragDropManager
  ) => void;
};

export function createNestedDroppablePlugin(
  options: NestedDroppablePluginOptions,
  instanceId: string
) {
  return {
    name: `nested-droppable-${instanceId}`,
    
    onDragEnd: (manager: DragDropManager) => {
      // Handle drag end
    },
    
    onDragOver: (
      event: any,
      manager: DragDropManager
    ) => {
      const active = manager.dragOperation.activator;
      const over = manager.dragOperation.over;
      
      if (!over) {
        options.onChange?.({ zone: null, area: null }, manager);
        return;
      }
      
      const overData = over.data;
      const zone = overData?.zone || null;
      const area = overData?.area || null;
      
      options.onChange?.({ zone, area }, manager);
    },
  };
}
