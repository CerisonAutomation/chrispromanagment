import type { Data } from "@puckeditor/core";

export interface BlockTypeInfo {
  type: string;
  label: string;
}

export function getBlockDefaults(type: string): Record<string, unknown> {
  return {};
}

export function getBlockTypeList(): BlockTypeInfo[] {
  return [
    { type: "Hero", label: "Hero Section" },
    { type: "Text", label: "Text Block" },
    { type: "Image", label: "Image Block" },
    { type: "Button", label: "Button" },
    { type: "Card", label: "Card" },
  ];
}

export function PageRenderer({ data }: { data: Data }) {
  return null;
}
