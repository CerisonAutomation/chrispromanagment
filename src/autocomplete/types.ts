// =============================================================================
// PRODUCTION-LEVEL AUTOCOMPLETE SYSTEM
// =============================================================================
// Complete type definitions for intelligent autocomplete

import type {BlockData, BlockId, BlockType} from '@/domain/complete-entities';
import type {Result} from '@/domain/complete-types';

// ---------------------------------------------------------------------------
// AUTOCOMPLETE ITEM TYPES
// ---------------------------------------------------------------------------

export type AutocompleteItemType = 
  | 'block'           // Block types (hero, text, image, etc.)
  | 'property'        // Block properties
  | 'command'         // Editor commands
  | 'snippet'         // Code snippets
  | 'template'        // Page templates
  | 'style'           // CSS classes/styles
  | 'icon'            // Icon names
  | 'color'           // Color values
  | 'font'            // Font families
  | 'ai-suggestion'   // AI-generated content
  | 'history'         // Recently used items
  | 'search-result';  // Search results

export interface AutocompleteItem {
  readonly id: string;
  readonly type: AutocompleteItemType;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string;
  readonly shortcut?: string;
  readonly category?: string;
  readonly priority: number;        // 0-100, higher = more relevant
  readonly data?: unknown;          // Type-specific data
  readonly metadata: {
    readonly recent?: boolean;
    readonly favorite?: boolean;
    readonly aiGenerated?: boolean;
    readonly usageCount?: number;
    readonly lastUsed?: number;
  };
}

// Block-specific autocomplete item
export interface BlockAutocompleteItem extends AutocompleteItem {
  readonly type: 'block';
  readonly data: {
    readonly blockType: BlockType;
    readonly defaultProps: BlockData;
    readonly preview?: string;      // Preview image/data URL
    readonly tags: string[];
  };
}

// Property autocomplete item
export interface PropertyAutocompleteItem extends AutocompleteItem {
  readonly type: 'property';
  readonly data: {
    readonly propertyName: string;
    readonly propertyType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color' | 'url' | 'email';
    readonly defaultValue?: unknown;
    readonly options?: readonly string[];  // For enum types
    readonly validation?: {
      readonly required?: boolean;
      readonly min?: number;
      readonly max?: number;
      readonly pattern?: string;
    };
  };
}

// Command autocomplete item
export interface CommandAutocompleteItem extends AutocompleteItem {
  readonly type: 'command';
  readonly data: {
    readonly commandId: string;
    readonly action: () => void | Promise<void>;
    readonly args?: Record<string, unknown>;
  };
}

// AI suggestion item
export interface AISuggestionItem extends AutocompleteItem {
  readonly type: 'ai-suggestion';
  readonly data: {
    readonly suggestionType: 'content' | 'layout' | 'style' | 'improvement';
    readonly originalText?: string;
    readonly suggestedText: string;
    readonly confidence: number;    // 0-1
    readonly reasoning?: string;
  };
}

// ---------------------------------------------------------------------------
// AUTOCOMPLETE CONTEXT
// ---------------------------------------------------------------------------

export type AutocompleteTrigger =
  | 'manual'          // User pressed trigger key (Cmd+Space)
  | 'typing'          // User typed a trigger character (/ or @)
  | 'selection'       // User selected text
  | 'ai-predict'      // AI predicted intent
  | 'context-change'; // Context changed (cursor moved, etc.)

export interface AutocompleteContext {
  readonly trigger: AutocompleteTrigger;
  readonly query: string;
  readonly cursorPosition: number;
  readonly selectionStart?: number;
  readonly selectionEnd?: number;
  readonly blockId?: BlockId;
  readonly blockType?: BlockType;
  readonly propertyName?: string;
  readonly previousText?: string;
  readonly afterText?: string;
}

export interface AutocompleteState {
  readonly isOpen: boolean;
  readonly items: readonly AutocompleteItem[];
  readonly selectedIndex: number;
  readonly context: AutocompleteContext | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly source: 'local' | 'ai' | 'hybrid';
}

// ---------------------------------------------------------------------------
// AUTOCOMPLETE PROVIDER INTERFACE
// ---------------------------------------------------------------------------

export interface AutocompleteProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedTypes: readonly AutocompleteItemType[];
  readonly priority: number;
  
  // Check if this provider can handle the context
  canActivate(context: AutocompleteContext): boolean;
  
  // Get suggestions
  getSuggestions(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>>;
  
  // Optional: Real-time updates as user types
  onQueryChange?(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>>;
}

// ---------------------------------------------------------------------------
// FUZZY MATCHING CONFIGURATION
// ---------------------------------------------------------------------------

export interface FuzzyMatchOptions {
  readonly threshold: number;           // 0-1, minimum match score
  readonly maxDistance: number;         // Maximum Levenshtein distance
  readonly includeScore: boolean;       // Include match score in results
  readonly caseSensitive: boolean;
  readonly tokenize: boolean;           // Split query into tokens
  readonly matchAllTokens: boolean;     // All tokens must match
  readonly findAllMatches: boolean;     // Find all matches, not just first
  readonly distance: number;             // Maximum search distance
  readonly keys: readonly string[];      // Object keys to search
}

export const defaultFuzzyOptions: FuzzyMatchOptions = {
  threshold: 0.4,
  maxDistance: 100,
  includeScore: true,
  caseSensitive: false,
  tokenize: true,
  matchAllTokens: false,
  findAllMatches: true,
  distance: 100,
  keys: ['label', 'description', 'category'],
};

// ---------------------------------------------------------------------------
// KEYBOARD NAVIGATION
// ---------------------------------------------------------------------------

export type AutocompleteKeyAction =
  | 'select-next'
  | 'select-prev'
  | 'select-first'
  | 'select-last'
  | 'confirm'
  | 'confirm-and-stay'
  | 'cancel'
  | 'filter-by-category'
  | 'toggle-details';

export interface KeyboardShortcut {
  readonly key: string;
  readonly modifiers: {
    readonly ctrl?: boolean;
    readonly alt?: boolean;
    readonly shift?: boolean;
    readonly meta?: boolean;
  };
  readonly action: AutocompleteKeyAction;
}

export const defaultAutocompleteShortcuts: readonly KeyboardShortcut[] = [
  { key: 'ArrowDown', modifiers: {}, action: 'select-next' },
  { key: 'ArrowUp', modifiers: {}, action: 'select-prev' },
  { key: 'Home', modifiers: {}, action: 'select-first' },
  { key: 'End', modifiers: {}, action: 'select-last' },
  { key: 'Enter', modifiers: {}, action: 'confirm' },
  { key: 'Tab', modifiers: {}, action: 'confirm' },
  { key: 'Enter', modifiers: { shift: true }, action: 'confirm-and-stay' },
  { key: 'Escape', modifiers: {}, action: 'cancel' },
  { key: 'Tab', modifiers: { shift: true }, action: 'select-prev' },
] as const;

// ---------------------------------------------------------------------------
// AUTOCOMPLETE EVENTS
// ---------------------------------------------------------------------------

export type AutocompleteEventType =
  | 'open'
  | 'close'
  | 'select'
  | 'confirm'
  | 'cancel'
  | 'query-change'
  | 'items-update'
  | 'error';

export interface AutocompleteEvent {
  readonly type: AutocompleteEventType;
  readonly timestamp: number;
  readonly context: AutocompleteContext;
  readonly data?: unknown;
}

export type AutocompleteEventHandler = (event: AutocompleteEvent) => void;

// ---------------------------------------------------------------------------
// AUTOCOMPLETE CONFIGURATION
// ---------------------------------------------------------------------------

export interface AutocompleteConfig {
  readonly debounceMs: number;
  readonly minQueryLength: number;
  readonly maxResults: number;
  readonly showCategories: boolean;
  readonly showRecent: boolean;
  readonly showShortcuts: boolean;
  readonly enableAI: boolean;
  readonly enableFuzzy: boolean;
  readonly fuzzyOptions: FuzzyMatchOptions;
  readonly shortcuts: readonly KeyboardShortcut[];
  readonly triggerCharacters: readonly string[];
  readonly providers: readonly string[];  // Provider IDs in priority order
}

export const defaultAutocompleteConfig: AutocompleteConfig = {
  debounceMs: 50,
  minQueryLength: 1,
  maxResults: 50,
  showCategories: true,
  showRecent: true,
  showShortcuts: true,
  enableAI: true,
  enableFuzzy: true,
  fuzzyOptions: defaultFuzzyOptions,
  shortcuts: defaultAutocompleteShortcuts,
  triggerCharacters: ['/', '@', '#', ':', '<'],
  providers: ['blocks', 'commands', 'snippets', 'ai'],
};

// ---------------------------------------------------------------------------
// AUTOCOMPLETE HISTORY
// ---------------------------------------------------------------------------

export interface AutocompleteHistoryItem {
  readonly item: AutocompleteItem;
  readonly usedAt: number;
  readonly useCount: number;
}

export interface AutocompleteHistory {
  readonly items: readonly AutocompleteHistoryItem[];
  readonly maxSize: number;
  
  add(item: AutocompleteItem): AutocompleteHistory;
  getRecent(limit?: number): readonly AutocompleteHistoryItem[];
  getFavorites(): readonly AutocompleteHistoryItem[];
  clear(): AutocompleteHistory;
}

// ---------------------------------------------------------------------------
// AI AUTOCOMPLETE SPECIFIC
// ---------------------------------------------------------------------------

export interface AIAutocompleteContext {
  readonly previousBlocks: readonly { type: BlockType; data: BlockData }[];
  readonly currentBlock: { type: BlockType; data: BlockData } | null;
  readonly pageContext: {
    readonly title: string;
    readonly description?: string;
    readonly theme: string;
  };
  readonly userIntent?: string;
  readonly partialInput: string;
}

export interface AIAutocompleteRequest {
  readonly context: AIAutocompleteContext;
  readonly suggestionTypes: readonly ('content' | 'layout' | 'style')[];
  readonly maxSuggestions: number;
  readonly temperature: number;
}

export interface AIAutocompleteResponse {
  readonly suggestions: readonly AISuggestionItem[];
  readonly processingTime: number;
  readonly model: string;
  readonly tokensUsed: number;
}

// ---------------------------------------------------------------------------
// UTILITY TYPES
// ---------------------------------------------------------------------------

export type AutocompleteItemGroup = {
  readonly category: string;
  readonly items: readonly AutocompleteItem[];
  readonly expanded: boolean;
};

export type AutocompleteFilter = {
  readonly type?: AutocompleteItemType;
  readonly category?: string;
  readonly recent?: boolean;
  readonly aiGenerated?: boolean;
};

export interface AutocompletePosition {
  readonly x: number;
  readonly y: number;
  readonly placement: 'above' | 'below' | 'left' | 'right';
  readonly availableSpace: {
    readonly above: number;
    readonly below: number;
    readonly left: number;
    readonly right: number;
  };
}
