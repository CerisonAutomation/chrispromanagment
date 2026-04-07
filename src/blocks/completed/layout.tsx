// =============================================================================
// LAYOUT BLOCKS - CANONICAL PUCK STANDARD
// 100% Compliance
// =============================================================================

import React from "react";
import type { ComponentConfig } from "@/lib/canonical-puck-types";
import { select, number } from "@/blocks/helpers";
import { DropZone } from '@measured/puck';

export const Columns: ComponentConfig<{
  columns: number;
  gap: number;
  padding: number;
  backgroundColor: string;
}> = {
  label: "Columns",
  category: "Layout",
  metadata: { description: "Responsive grid columns layout with nested drop zones" },
  defaultProps: {
    columns: 2,
    gap: 32,
    padding: 64,
    backgroundColor: "white",
  },
  fields: {
    columns: number("Columns", 1, 6),
    gap: number("Gap (px)", 0, 100),
    padding: number("Padding (px)", 0, 200),
    backgroundColor: select("Background", [
      { label: "White", value: "white" },
      { label: "Light Gray", value: "neutral-50" },
      { label: "Dark", value: "neutral-900" },
      { label: "Primary", value: "primary" },
      { label: "Transparent", value: "transparent" },
    ]),
  },
  render: ({ columns, gap, padding, backgroundColor }) => {
    const bgClass = backgroundColor === 'primary'
      ? 'bg-primary'
      : backgroundColor === 'transparent'
        ? ''
        : `bg-${backgroundColor}`;

    return (
      <div className={`${bgClass} w-full`} style={{ padding: `${padding}px 0` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="min-h-[100px]">
                <DropZone zone={`column-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const Container: ComponentConfig<{
  maxWidth: string;
  padding: number;
  backgroundColor: string;
}> = {
  label: "Container",
  category: "Layout",
  metadata: { description: "Constrained width container with single drop zone" },
  defaultProps: {
    maxWidth: "80rem",
    padding: 64,
    backgroundColor: "white",
  },
  fields: {
    maxWidth: select("Max Width", [
      { label: "Full Width", value: "100%" },
      { label: "7xl (1280px)", value: "80rem" },
      { label: "6xl (1152px)", value: "72rem" },
      { label: "5xl (1024px)", value: "64rem" },
      { label: "4xl (896px)", value: "56rem" },
    ]),
    padding: number("Padding (px)", 0, 200),
    backgroundColor: select("Background", [
      { label: "White", value: "white" },
      { label: "Light Gray", value: "neutral-50" },
      { label: "Dark", value: "neutral-900" },
      { label: "Primary", value: "primary" },
    ]),
  },
  render: ({ maxWidth, padding, backgroundColor }) => {
    const bgClass = backgroundColor === 'primary'
      ? 'bg-primary'
      : `bg-${backgroundColor}`;

    return (
      <div className={`${bgClass} w-full`} style={{ padding: `${padding}px 0` }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth }}>
          <DropZone zone="content" />
        </div>
      </div>
    );
  },
};

export const Spacer: ComponentConfig<{
  height: number;
}> = {
  label: "Spacer",
  category: "Layout",
  metadata: { description: "Vertical spacing element" },
  defaultProps: {
    height: 64,
  },
  fields: {
    height: number("Height (px)", 8, 400),
  },
  render: ({ height }) => {
    return <div style={{ height }} />;
  },
};

export const Divider: ComponentConfig<{
  style: string;
  color: string;
  thickness: number;
}> = {
  label: "Divider",
  category: "Layout",
  metadata: { description: "Horizontal divider line" },
  defaultProps: {
    style: "solid",
    color: "#e5e5e5",
    thickness: 1,
  },
  fields: {
    style: select("Style", [
      { label: "Solid", value: "solid" },
      { label: "Dashed", value: "dashed" },
      { label: "Dotted", value: "dotted" },
    ]),
    color: select("Color", [
      { label: "Light Gray", value: "#e5e5e5" },
      { label: "Gray", value: "#a3a3a3" },
      { label: "Dark", value: "#262626" },
      { label: "Primary", value: "hsl(var(--primary))" },
    ]),
    thickness: number("Thickness (px)", 1, 10),
  },
  render: ({ style, color, thickness }) => {
    return (
      <div className="w-full py-8">
        <hr
          style={{
            borderTopStyle: style,
            borderTopWidth: thickness,
            borderTopColor: color,
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
          }}
        />
      </div>
    );
  },
};