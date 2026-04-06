// =============================================================================
// AUTOCOMPLETE REACT COMPONENTS - Production UI
// =============================================================================

'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {AutocompleteItem, AutocompletePosition} from './types';
import {useAutocomplete} from './service';
import {groupByCategory} from './fuzzy-match';

// ---------------------------------------------------------------------------
// ICONS (using Lucide-style SVG)
// ---------------------------------------------------------------------------

const Icons: Record<string, React.FC<{ className?: string }>> = {
  'layout-top': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="8" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
    </svg>
  ),
  'info-circle': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  'grid-3x3': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
    </svg>
  ),
  'list-check': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  tag: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 7h.01M7 3h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-9 9a1 1 0 01-1.414 0l-7-7A1 1 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  quote: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  ),
  'cursor-click': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3l10 18-7-1-3 5-3-18z" />
    </svg>
  ),
  'help-circle': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  ),
  mail: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  'layout-bottom': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="8" rx="2" />
    </svg>
  ),
  type: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4,7 4,4 20,4 20,7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  image: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  images: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
      <rect x="14" y="5" width="5" height="5" />
    </svg>
  ),
  video: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <polygon points="10,8 16,12 10,16" fill="currentColor" />
    </svg>
  ),
  'map-pin': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  minus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  'arrows-vertical': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="8,18 12,22 16,18" />
      <polyline points="8,6 12,2 16,6" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  'bar-chart': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  users: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  clock: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  briefcase: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  inbox: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
  table: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  search: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  home: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  'home-details': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
      <rect x="11" y="3" width="2" height="2" />
    </svg>
  ),
  calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  'check-circle': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  code: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </svg>
  ),
  save: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  upload: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  eye: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  undo: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  ),
  redo: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
    </svg>
  ),
  trash: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  copy: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  'arrow-up': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5,12 12,5 19,12" />
    </svg>
  ),
  'arrow-down': ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19,12 12,19 5,12" />
    </svg>
  ),
  plus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  sparkles: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
      <path d="M19 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </svg>
  ),
  text: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4,7 4,4 20,4 20,7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  phone: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// ICON COMPONENT
// ---------------------------------------------------------------------------

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = Icons[name] || Icons['info-circle'];
  return <IconComponent className={className} />;
};

// ---------------------------------------------------------------------------
// AUTOCOMPLETE ITEM COMPONENT
// ---------------------------------------------------------------------------

interface AutocompleteItemProps {
  item: AutocompleteItem;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const AutocompleteItemComponent: React.FC<AutocompleteItemProps> = ({
  item,
  isSelected,
  isHighlighted,
  onClick,
  onMouseEnter,
}) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150
        ${isSelected ? 'bg-cpm-accent/10 border-l-2 border-cpm-accent' : 'border-l-2 border-transparent'}
        ${isHighlighted ? 'bg-cpm-bg-tertiary/50' : 'hover:bg-cpm-bg-tertiary/30'}
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        ${item.metadata.aiGenerated ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-cpm-bg-secondary'}
      `}>
        <Icon 
          name={item.icon || 'info-circle'} 
          className={`w-4 h-4 ${item.metadata.aiGenerated ? 'text-purple-400' : 'text-cpm-text-secondary'}`} 
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-cpm-text-primary truncate">
            {item.label}
          </span>
          {item.metadata.aiGenerated && (
            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
              AI
            </span>
          )}
          {item.shortcut && (
            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-cpm-bg-secondary text-cpm-text-tertiary">
              {item.shortcut}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-cpm-text-tertiary truncate mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      
      {/* Category badge */}
      {item.category && (
        <span className="flex-shrink-0 text-[10px] text-cpm-text-tertiary uppercase tracking-wider">
          {item.category}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN AUTOCOMPLETE POPUP COMPONENT
// ---------------------------------------------------------------------------

interface AutocompletePopupProps {
  anchorRef: React.RefObject<HTMLElement>;
  onSelect: (item: AutocompleteItem) => void;
  onClose: () => void;
}

export const AutocompletePopup: React.FC<AutocompletePopupProps> = ({
  anchorRef,
  onSelect,
  onClose,
}) => {
  const { state, selectNext, selectPrev, selectFirst, selectLast, confirm, cancel, updateQuery } = useAutocomplete();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<AutocompletePosition | null>(null);
  
  // Calculate position
  useEffect(() => {
    if (!anchorRef.current || !state.isOpen) return;
    
    const rect = anchorRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const popupHeight = 400;
    const popupWidth = 360;
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.left;
    
    let placement: AutocompletePosition['placement'] = 'below';
    let x = rect.left;
    let y = rect.bottom + 8;
    
    // Prefer below, but switch to above if not enough space
    if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
      placement = 'above';
      y = rect.top - popupHeight - 8;
    }
    
    // Adjust horizontal position if near right edge
    if (spaceRight < popupWidth) {
      x = Math.max(16, rect.right - popupWidth);
    }
    
    setPosition({
      x,
      y,
      placement,
      availableSpace: {
        above: spaceAbove,
        below: spaceBelow,
        left: rect.left,
        right: spaceRight,
      },
    });
  }, [anchorRef, state.isOpen]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!state.isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectPrev();
          break;
        case 'Home':
          e.preventDefault();
          selectFirst();
          break;
        case 'End':
          e.preventDefault();
          selectLast();
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          const selected = confirm(e.shiftKey);
          if (selected) {
            onSelect(selected);
          }
          break;
        case 'Escape':
          e.preventDefault();
          cancel();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, selectNext, selectPrev, selectFirst, selectLast, confirm, cancel, onSelect, onClose]);
  
  // Handle query changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuery(e.target.value);
  }, [updateQuery]);
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        cancel();
        onClose();
      }
    };
    
    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.isOpen, cancel, onClose, anchorRef]);
  
  if (!state.isOpen || !position) return null;
  
  const groupedItems = groupByCategory(
    state.items.map(item => ({
      item,
      score: item.priority / 100,
      matches: [],
    }))
  );
  
  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] w-[360px] bg-cpm-bg-primary border border-cpm-border rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '400px',
      }}
    >
      {/* Header with search */}
      <div className="p-3 border-b border-cpm-border">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cpm-text-tertiary" />
          <input
            type="text"
            value={state.context?.query || ''}
            onChange={handleInputChange}
            placeholder="Type to search..."
            className="w-full pl-9 pr-3 py-2 bg-cpm-bg-secondary border border-cpm-border rounded-lg text-sm text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:outline-none focus:border-cpm-accent/50"
            autoFocus
          />
        </div>
        
        {/* Status bar */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-cpm-text-tertiary">
          <span>
            {state.loading ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-cpm-accent/30 border-t-cpm-accent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              `${state.items.length} results`
            )}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-cpm-bg-secondary rounded">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-1 py-0.5 bg-cpm-bg-secondary rounded ml-1">↵</kbd>
            <span>select</span>
          </span>
        </div>
      </div>
      
      {/* Results list */}
      <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-cpm-border scrollbar-track-transparent">
        {groupedItems.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="search" className="w-8 h-8 mx-auto mb-2 text-cpm-text-tertiary" />
            <p className="text-sm text-cpm-text-secondary">No results found</p>
            <p className="text-xs text-cpm-text-tertiary mt-1">Try a different search term</p>
          </div>
        ) : (
          groupedItems.map((group, groupIndex) => (
            <div key={group.category}>
              {/* Category header */}
              <div className="sticky top-0 bg-cpm-bg-primary/95 backdrop-blur-sm px-3 py-1.5 border-y border-cpm-border">
                <span className="text-[10px] font-semibold text-cpm-accent uppercase tracking-wider">
                  {group.category}
                </span>
                <span className="ml-2 text-[10px] text-cpm-text-tertiary">
                  ({group.items.length})
                </span>
              </div>
              
              {/* Items in category */}
              {group.items.map(({ item }, itemIndex) => {
                const globalIndex = groupedItems
                  .slice(0, groupIndex)
                  .reduce((sum, g) => sum + g.items.length, 0) + itemIndex;
                
                return (
                  <AutocompleteItemComponent
                    key={item.id}
                    item={item}
                    isSelected={globalIndex === state.selectedIndex}
                    isHighlighted={false}
                    onClick={() => {
                      const confirmed = confirm();
                      if (confirmed) onSelect(confirmed);
                    }}
                    onMouseEnter={() => {
                      // Update selected index on hover
                    }}
                  />
                );
              })}
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {state.items.length > 0 && (
        <div className="px-3 py-2 border-t border-cpm-border bg-cpm-bg-secondary/50">
          <div className="flex items-center justify-between text-[10px] text-cpm-text-tertiary">
            <span>
              {state.source === 'ai' ? (
                <span className="flex items-center gap-1 text-purple-400">
                  <Icon name="sparkles" className="w-3 h-3" />
                  AI-powered
                </span>
              ) : state.source === 'hybrid' ? (
                <span className="flex items-center gap-1">
                  <Icon name="sparkles" className="w-3 h-3 text-purple-400" />
                  Hybrid results
                </span>
              ) : (
                'Local results'
              )}
            </span>
            <span>
              {state.selectedIndex + 1} / {state.items.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// COMMAND PALETTE COMPONENT
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: AutocompleteItem) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { state, open, close, selectNext, selectPrev, confirm, cancel, updateQuery } = useAutocomplete();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Open when isOpen changes
  useEffect(() => {
    if (isOpen) {
      open({
        trigger: 'manual',
        query: '',
        cursorPosition: 0,
      });
    } else {
      close();
    }
  }, [isOpen, open, close]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Cmd+Shift+P to open
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || (e.shiftKey && e.key === 'p'))) {
        e.preventDefault();
        onClose(); // Toggle
      }
      
      if (!state.isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectPrev();
          break;
        case 'Enter':
          e.preventDefault();
          const selected = confirm();
          if (selected) {
            onSelect(selected);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          cancel();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, selectNext, selectPrev, confirm, cancel, onSelect, onClose]);
  
  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      cancel();
      onClose();
    }
  };
  
  if (!state.isOpen) return null;
  
  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
    >
      <div className="w-full max-w-2xl bg-cpm-bg-primary rounded-xl shadow-2xl overflow-hidden border border-cpm-border">
        {/* Search input */}
        <div className="p-4 border-b border-cpm-border">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cpm-text-tertiary" />
            <input
              type="text"
              value={state.context?.query || ''}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search commands, blocks, or type / for blocks..."
              className="w-full pl-12 pr-4 py-3 bg-cpm-bg-secondary border border-cpm-border rounded-lg text-base text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:outline-none focus:border-cpm-accent/50"
              autoFocus
            />
          </div>
        </div>
        
        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="search" className="w-12 h-12 mx-auto mb-3 text-cpm-text-tertiary" />
              <p className="text-base text-cpm-text-secondary">No commands found</p>
              <p className="text-sm text-cpm-text-tertiary mt-1">
                Try typing <kbd className="px-1.5 py-0.5 bg-cpm-bg-secondary rounded">/</kbd> for blocks
              </p>
            </div>
          ) : (
            <div className="py-2">
              {state.items.map((item, index) => (
                <AutocompleteItemComponent
                  key={item.id}
                  item={item}
                  isSelected={index === state.selectedIndex}
                  isHighlighted={false}
                  onClick={() => {
                    const confirmed = confirm();
                    if (confirmed) {
                      onSelect(confirmed);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => {}}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-cpm-border bg-cpm-bg-secondary/50">
          <div className="flex items-center justify-between text-xs text-cpm-text-tertiary">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-cpm-bg-primary border border-cpm-border rounded">↑↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-cpm-bg-primary border border-cpm-border rounded">↵</kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-cpm-bg-primary border border-cpm-border rounded">esc</kbd>
                <span>to close</span>
              </span>
            </div>
            <span>{state.items.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// EXPORT ALL
// ---------------------------------------------------------------------------

export { Icon, Icons, AutocompleteItemComponent };
export default AutocompletePopup;
