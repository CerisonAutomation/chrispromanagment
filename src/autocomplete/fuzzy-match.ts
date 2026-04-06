// =============================================================================
// FUZZY MATCHING ENGINE - Production-grade search
// =============================================================================

import type {AutocompleteItem, FuzzyMatchOptions} from './types';
import {defaultFuzzyOptions} from './types';

// Levenshtein distance calculation
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  // Create matrix
  const matrix: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= m; i++) matrix[i][0] = i;
  for (let j = 0; j <= n; j++) matrix[0][j] = j;
  
  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,    // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[m][n];
}

// Calculate match score (0-1, higher is better)
export function calculateMatchScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (q === t) return 1;
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.8;
  
  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  
  if (distance > maxLen * 0.5) return 0;
  
  return 1 - (distance / maxLen);
}

// Tokenize string
function tokenize(str: string): string[] {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 0);
}

// Match item against query
export interface MatchResult {
  readonly item: AutocompleteItem;
  readonly score: number;
  readonly matches: readonly { key: string; indices: readonly [number, number][] }[];
}

export function matchItem(
  item: AutocompleteItem,
  query: string,
  options: FuzzyMatchOptions = defaultFuzzyOptions
): MatchResult | null {
  const queryTokens = options.tokenize ? tokenize(query) : [query.toLowerCase()];
  const keys = options.keys || ['label', 'description', 'category'];
  
  let totalScore = 0;
  const matches: MatchResult['matches'] = [];
  
  for (const key of keys) {
    const value = String((item as Record<string, unknown>)[key] || '');
    if (!value) continue;
    
    const valueLower = value.toLowerCase();
    let keyScore = 0;
    const keyMatches: [number, number][] = [];
    
    if (options.tokenize && options.matchAllTokens) {
      // All tokens must match
      const allMatch = queryTokens.every(token => {
        const idx = valueLower.indexOf(token);
        if (idx !== -1) {
          keyMatches.push([idx, idx + token.length]);
          return true;
        }
        return false;
      });
      
      if (!allMatch) continue;
      keyScore = 0.7;
    } else {
      // Any token can match
      for (const token of queryTokens) {
        if (valueLower === token) {
          keyScore = Math.max(keyScore, 1);
          keyMatches.push([0, value.length]);
        } else if (valueLower.startsWith(token)) {
          keyScore = Math.max(keyScore, 0.9);
          keyMatches.push([0, token.length]);
        } else if (valueLower.includes(token)) {
          keyScore = Math.max(keyScore, 0.8);
          const idx = valueLower.indexOf(token);
          keyMatches.push([idx, idx + token.length]);
        } else {
          // Fuzzy match
          const fuzzyScore = calculateMatchScore(token, value);
          if (fuzzyScore > options.threshold) {
            keyScore = Math.max(keyScore, fuzzyScore * 0.6);
          }
        }
      }
    }
    
    if (keyScore > 0) {
      totalScore += keyScore;
      if (keyMatches.length > 0) {
        matches.push({ key, indices: keyMatches });
      }
    }
  }
  
  // Boost score for recent/favorite items
  if (item.metadata.recent) totalScore += 0.1;
  if (item.metadata.favorite) totalScore += 0.15;
  if (item.metadata.aiGenerated) totalScore += 0.05;
  
  // Boost by usage count
  if (item.metadata.usageCount && item.metadata.usageCount > 0) {
    totalScore += Math.min(item.metadata.usageCount * 0.02, 0.1);
  }
  
  // Normalize score
  const normalizedScore = Math.min(totalScore / keys.length, 1);
  
  if (normalizedScore < options.threshold) return null;
  
  return {
    item,
    score: normalizedScore,
    matches,
  };
}

// Search through multiple items
export function searchItems(
  items: readonly AutocompleteItem[],
  query: string,
  options: FuzzyMatchOptions = defaultFuzzyOptions,
  maxResults: number = 50
): readonly MatchResult[] {
  if (!query.trim()) {
    return items.map(item => ({
      item,
      score: item.priority / 100,
      matches: [],
    }));
  }
  
  const results: MatchResult[] = [];
  
  for (const item of items) {
    const match = matchItem(item, query, options);
    if (match) {
      results.push(match);
    }
  }
  
  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, maxResults);
}

// Group results by category
export function groupByCategory(
  results: readonly MatchResult[]
): Array<{ category: string; items: MatchResult[] }> {
  const groups = new Map<string, MatchResult[]>();
  
  for (const result of results) {
    const category = result.item.category || 'Other';
    const existing = groups.get(category) || [];
    existing.push(result);
    groups.set(category, existing);
  }
  
  // Sort categories by total score
  const sorted = Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      items,
      totalScore: items.reduce((sum, i) => sum + i.score, 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return sorted.map(({ category, items }) => ({ category, items }));
}
