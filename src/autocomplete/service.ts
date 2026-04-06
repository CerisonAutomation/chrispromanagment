// =============================================================================
// AUTOCOMPLETE SERVICE - Optimized with Trie Index
// =============================================================================

import type {AutocompleteItem, AutocompleteProvider, FuzzyMatchOptions} from './types';
import {defaultFuzzyOptions} from './types';
import {searchItems, groupByCategory} from './fuzzy-match';
import {TrieIndex, getTrieIndex} from './trie-index';

export type {AutocompleteProvider};

class AutocompleteService {
  private providers: AutocompleteProvider[] = [];
  private history: string[] = [];
  private favorites: Set<string> = new Set();
  private trieIndex: TrieIndex;
  private cachedItems: AutocompleteItem[] = [];
  private lastQuery: string = '';

  constructor() {
    this.trieIndex = getTrieIndex();
  }

  // Register a provider
  registerProvider(provider: AutocompleteProvider): void {
    this.providers.push(provider);
  }

  // Get all items from all providers
  async getAllItems(): Promise<AutocompleteItem[]> {
    const results = await Promise.all(
      this.providers.map(provider => provider.getItems())
    );
    
    // Flatten and deduplicate
    const allItems = results.flat();
    const seen = new Set<string>();
    
    return allItems.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  // Search with trie optimization for prefix queries
  async search(
    query: string,
    options: FuzzyMatchOptions = defaultFuzzyOptions,
    maxResults: number = 50
  ): Promise<{
    items: readonly AutocompleteItem[];
    groups: Array<{category: string; items: AutocompleteItem[]}>;
  }> {
    const items = await this.getAllItems();
    
    // Update trie index if items changed
    if (this.cachedItems !== items) {
      this.trieIndex.index(items);
      this.cachedItems = items;
    }
    
    // For prefix-only queries (no special chars), use trie for O(1) speed
    const isPrefixQuery = /^[a-zA-Z0-9\s]*$/.test(query) && !query.includes('~');
    
    let results: AutocompleteItem[];
    
    if (isPrefixQuery && query.length > 0) {
      // Use trie for fast prefix search
      results = this.trieIndex.searchByPrefix(query);
    } else {
      // Use fuzzy search for complex queries
      const fuzzyResults = searchItems(items, query, options, maxResults);
      results = fuzzyResults.map(r => r.item);
    }
    
    // Apply metadata boosts
    results = results.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        recent: this.history.includes(item.id),
        favorite: this.favorites.has(item.id),
      },
    }));
    
    // Group results
    const groups = groupByCategory(
      results.map(item => ({item, score: 1, matches: [] as any}))
    );
    
    this.lastQuery = query;
    
    return {items: results.slice(0, maxResults), groups};
  }

  // Add to history
  addToHistory(itemId: string): void {
    this.history = [itemId, ...this.history.filter(id => id !== itemId)].slice(0, 50);
    this.saveHistory();
  }

  // Toggle favorite
  toggleFavorite(itemId: string): boolean {
    if (this.favorites.has(itemId)) {
      this.favorites.delete(itemId);
      return false;
    }
    this.favorites.add(itemId);
    this.saveFavorites();
    return true;
  }

  // Get suggestions (lightweight, for autocomplete dropdown)
  async getSuggestions(
    query: string,
    maxSuggestions: number = 8
  ): Promise<readonly AutocompleteItem[]> {
    const {items} = await this.search(query, defaultFuzzyOptions, maxSuggestions);
    return items;
  }

  // Clear cache
  clearCache(): void {
    this.cachedItems = [];
    this.trieIndex.clear();
  }

  // Private methods
  private saveHistory(): void {
    try {
      localStorage.setItem('autocomplete-history', JSON.stringify(this.history));
    } catch {}
  }

  private saveFavorites(): void {
    try {
      localStorage.setItem('autocomplete-favorites', JSON.stringify([...this.favorites]));
    } catch {}
  }

  private loadHistory(): void {
    try {
      const saved = localStorage.getItem('autocomplete-history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch {}
  }

  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem('autocomplete-favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch {}
  }
}

// Singleton instance
let serviceInstance: AutocompleteService | null = null;

export const autocompleteService = new AutocompleteService();

export function getAutocompleteService(): AutocompleteService {
  return autocompleteService;
}
