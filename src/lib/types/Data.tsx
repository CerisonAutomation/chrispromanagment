// =============================================================================
// CANONICAL PUCK DATA TYPES
// =============================================================================

export type ZoneType = "root" | "slot" | "dropzone";

export interface ComponentData<P = any> {
  type: string;
  props: P & { id: string };
  readOnly?: boolean;
}

export type Content = Array<ComponentData>;

export type RootData = {
  props: Record<string, unknown>;
  readOnly?: boolean;
};

export type Data = {
  content: Content;
  root: RootData;
  zones?: Record<string, Content>;
};
