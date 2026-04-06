'use client';

import React from 'react';
import { DropZone } from '@measured/puck';

// =============================================================================
// LAYOUT BLOCKS
// =============================================================================

export const ColumnsBlock = {
  fields: {
    columns: {
      type: 'number',
      label: 'Columns',
      min: 1,
      max: 6,
    },
    gap: {
      type: 'number',
      label: 'Gap (px)',
      min: 0,
      max: 100,
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 0,
      max: 200,
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light Gray', value: 'neutral-50' },
        { label: 'Dark', value: 'neutral-900' },
        { label: 'Primary', value: 'primary' },
        { label: 'Transparent', value: 'transparent' },
      ],
    },
  },
  defaultProps: {
    columns: 2,
    gap: 32,
    padding: 64,
    backgroundColor: 'white',
  },
  render: ({ columns, gap, padding, backgroundColor }: any) => {
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

export const ContainerBlock = {
  fields: {
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      options: [
        { label: 'Full Width', value: '100%' },
        { label: '7xl (1280px)', value: '80rem' },
        { label: '6xl (1152px)', value: '72rem' },
        { label: '5xl (1024px)', value: '64rem' },
        { label: '4xl (896px)', value: '56rem' },
      ],
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 0,
      max: 200,
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light Gray', value: 'neutral-50' },
        { label: 'Dark', value: 'neutral-900' },
        { label: 'Primary', value: 'primary' },
      ],
    },
  },
  defaultProps: {
    maxWidth: '80rem',
    padding: 64,
    backgroundColor: 'white',
  },
  render: ({ maxWidth, padding, backgroundColor }: any) => {
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

export const SpacerBlock = {
  fields: {
    height: {
      type: 'number',
      label: 'Height (px)',
      min: 8,
      max: 400,
    },
  },
  defaultProps: {
    height: 64,
  },
  render: ({ height }: any) => {
    return <div style={{ height }} />;
  },
};

export const DividerBlock = {
  fields: {
    style: {
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Light Gray', value: '#e5e5e5' },
        { label: 'Gray', value: '#a3a3a3' },
        { label: 'Dark', value: '#262626' },
        { label: 'Primary', value: 'hsl(var(--primary))' },
      ],
    },
    thickness: {
      type: 'number',
      label: 'Thickness (px)',
      min: 1,
      max: 10,
    },
  },
  defaultProps: {
    style: 'solid',
    color: '#e5e5e5',
    thickness: 1,
  },
  render: ({ style, color, thickness }: any) => {
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
