export interface BlockConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface Props {
  blocks: BlockConfig[];
  onChange: (blocks: BlockConfig[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function DragDropPageBuilder({ blocks, onChange, onSave, isSaving }: Props) {
  return (
    <div className="glass-surface rounded-lg p-8 text-center">
      <p className="text-muted-foreground text-sm">Drag & drop page builder — coming soon.</p>
      <p className="text-xs text-muted-foreground mt-1">{blocks.length} blocks configured</p>
    </div>
  );
}
