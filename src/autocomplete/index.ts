// =============================================================================
// AUTOCOMPLETE SYSTEM - Barrel Export
// =============================================================================

export * from './types';
export * from './fuzzy-match';
export * from './trie-index'; // O(1) prefix search optimization
export * from './service';
export * from './providers';
export { 
  AutocompletePopup, 
  CommandPalette, 
  Icon, 
  Icons, 
  AutocompleteItemComponent 
} from './components';

// =============================================================================
// QUICK START SETUP
// =============================================================================

import {autocompleteService} from './service';
import {aiProvider, blockProvider, commandProvider, snippetProvider} from './providers';

// Register all providers
export function setupAutocomplete(): void {
  autocompleteService.registerProvider(blockProvider);
  autocompleteService.registerProvider(commandProvider);
  autocompleteService.registerProvider(aiProvider);
  autocompleteService.registerProvider(snippetProvider);
}

// Auto-setup on import
setupAutocomplete();

export { autocompleteService };
export default autocompleteService;
