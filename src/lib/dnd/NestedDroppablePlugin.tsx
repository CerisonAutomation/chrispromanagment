// =============================================================================
// NESTED DROPPABLE PLUGIN
// Custom collision detection for nested drops
// =============================================================================

type NestedDroppablePluginOptions = {
  onChange?: (
    params: { zone: string | null; area: string | null },
    manager: any
  ) => void;
};

export function createNestedDroppablePlugin(
  options: NestedDroppablePluginOptions,
  instanceId: string
) {
  return {
    name: `nested-droppable-${instanceId}`,
    
    onDragEnd: (manager: any) => {
      // Handle drag end
    },
    
    onDragOver: (
      event: any,
      manager: any
    ) => {
      const over = event?.over;
      
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
