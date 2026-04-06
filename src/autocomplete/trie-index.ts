// =============================================================================
// TRIE INDEX FOR O(1) PREFIX SEARCH - Maximum Performance
// =============================================================================

import type { AutocompleteItem } from './types';

interface TrieNode {
  children: Map<string, TrieNode>;
  items: Set<string>; // item ids
  isEndOfWord: boolean;
}

export class TrieIndex {
  private root: TrieNode;
  private itemMap: Map<string, AutocompleteItem>;

  constructor() {
    this.root = this.createNode();
    this.itemMap = new Map();
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      items: new Set(),
      isEndOfWord: false,
    };
  }

  // Index items for fast prefix search
  index(items: readonly AutocompleteItem[]): void {
    this.root = this.createNode();
    this.itemMap.clear();

    for (const item of items) {
      this.itemMap.set(item.id, item);
      // Index by label (primary key)
      this.insert(item.id, item.label.toLowerCase());
      // Index by description
      if (item.description) {
        this.insert(item.id, item.description.toLowerCase());
      }
      // Index by category
      this.insert(item.id, item.category.toLowerCase());
    }
  }

  private insert(itemId: string, word: string): void {
    let node = this.root;
    const chars = [...word];

    for (const char of chars) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char)!;
      // Add item to all prefixes
      node.items.add(itemId);
    }
    node.isEndOfWord = true;
  }

  // O(k) prefix search where k = prefix length
  searchByPrefix(prefix: string): readonly AutocompleteItem[] {
    const normalizedPrefix = prefix.toLowerCase().trim();
    if (!normalizedPrefix) {
      return Array.from(this.itemMap.values());
    }

    let node = this.root;
    const chars = [...normalizedPrefix];

    // Navigate to prefix node
    for (const char of chars) {
      if (!node.children.has(char)) {
        return []; // No matches
      }
      node = node.children.get(char)!;
    }

    // Get all items at this prefix
    const results: AutocompleteItem[] = [];
    for (const itemId of node.items) {
      const item = this.itemMap.get(itemId);
      if (item) {
        results.push(item);
      }
    }

    // Sort by priority
    return results.sort((a, b) => b.priority - a.priority);
  }

  // Clear the index
  clear(): void {
    this.root = this.createNode();
    this.itemMap.clear();
  }

  // Get index size
  get size(): number {
    return this.itemMap.size;
  }
}

// Singleton instance for reuse
let globalTrieIndex: TrieIndex | null = null;

export function getTrieIndex(): TrieIndex {
  if (!globalTrieIndex) {
    globalTrieIndex = new TrieIndex();
  }
  return globalTrieIndex;
}
