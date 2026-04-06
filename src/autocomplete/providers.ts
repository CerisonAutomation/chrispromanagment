// =============================================================================
// AUTOCOMPLETE PROVIDERS - Block, Command, AI providers
// =============================================================================

import type {
    AISuggestionItem,
    AutocompleteContext,
    AutocompleteItem,
    AutocompleteProvider,
    BlockAutocompleteItem,
    CommandAutocompleteItem,
    Result,
} from './types';

import type {BlockData, BlockType} from '@/domain/complete-entities';
import {ok} from '@/domain/complete-types';
import {searchItems} from './fuzzy-match';

// ---------------------------------------------------------------------------
// BLOCK PROVIDER
// ---------------------------------------------------------------------------

const blockDefinitions: Record<BlockType, { label: string; description: string; icon: string; category: string; defaultProps: BlockData }> = {
  hero: {
    label: 'Hero Section',
    description: 'Full-width banner with title and CTA',
    icon: 'layout-top',
    category: 'Layout',
    defaultProps: { title: '', subtitle: '', backgroundImage: '', ctaText: '', ctaLink: '' },
  },
  about: {
    label: 'About Section',
    description: 'Text content with optional image',
    icon: 'info-circle',
    category: 'Content',
    defaultProps: { heading: '', content: '', image: '', imagePosition: 'right' },
  },
  services: {
    label: 'Services Grid',
    description: 'Display services in a grid layout',
    icon: 'grid-3x3',
    category: 'Content',
    defaultProps: { heading: '', items: [] },
  },
  features: {
    label: 'Features List',
    description: 'Highlight key features with icons',
    icon: 'list-check',
    category: 'Content',
    defaultProps: { heading: '', features: [] },
  },
  pricing: {
    label: 'Pricing Table',
    description: 'Display pricing plans',
    icon: 'tag',
    category: 'Commerce',
    defaultProps: { heading: '', plans: [], currency: 'USD' },
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Customer reviews and quotes',
    icon: 'quote',
    category: 'Social',
    defaultProps: { heading: '', testimonials: [] },
  },
  cta: {
    label: 'Call to Action',
    description: 'Prominent action button section',
    icon: 'cursor-click',
    category: 'Conversion',
    defaultProps: { heading: '', subheading: '', buttonText: '', buttonLink: '' },
  },
  faq: {
    label: 'FAQ Section',
    description: 'Accordion-style questions and answers',
    icon: 'help-circle',
    category: 'Content',
    defaultProps: { heading: '', items: [] },
  },
  contact: {
    label: 'Contact Form',
    description: 'Contact information and form',
    icon: 'mail',
    category: 'Forms',
    defaultProps: { heading: '', fields: [], email: '', phone: '', address: '' },
  },
  footer: {
    label: 'Footer',
    description: 'Site footer with links and copyright',
    icon: 'layout-bottom',
    category: 'Layout',
    defaultProps: { columns: [], copyright: '', socialLinks: [] },
  },
  text: {
    label: 'Text Block',
    description: 'Simple text content',
    icon: 'type',
    category: 'Basic',
    defaultProps: { content: '', align: 'left' },
  },
  image: {
    label: 'Image',
    description: 'Single image with caption',
    icon: 'image',
    category: 'Media',
    defaultProps: { src: '', alt: '', caption: '', width: '100%' },
  },
  gallery: {
    label: 'Image Gallery',
    description: 'Grid or carousel of images',
    icon: 'images',
    category: 'Media',
    defaultProps: { images: [], layout: 'grid', columns: 3 },
  },
  video: {
    label: 'Video',
    description: 'Embedded video player',
    icon: 'video',
    category: 'Media',
    defaultProps: { url: '', autoplay: false, controls: true },
  },
  map: {
    label: 'Map',
    description: 'Interactive location map',
    icon: 'map-pin',
    category: 'Media',
    defaultProps: { lat: 0, lng: 0, zoom: 15, address: '' },
  },
  divider: {
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: 'minus',
    category: 'Basic',
    defaultProps: { style: 'solid', spacing: 'medium' },
  },
  spacer: {
    label: 'Spacer',
    description: 'Empty vertical space',
    icon: 'arrows-vertical',
    category: 'Basic',
    defaultProps: { height: 60 },
  },
  stats: {
    label: 'Statistics',
    description: 'Number counters and stats',
    icon: 'bar-chart',
    category: 'Content',
    defaultProps: { heading: '', items: [] },
  },
  team: {
    label: 'Team Members',
    description: 'Team profile cards',
    icon: 'users',
    category: 'Social',
    defaultProps: { heading: '', members: [] },
  },
  timeline: {
    label: 'Timeline',
    description: 'Vertical timeline of events',
    icon: 'clock',
    category: 'Content',
    defaultProps: { heading: '', events: [] },
  },
  'logo-bar': {
    label: 'Logo Bar',
    description: 'Partner/client logos',
    icon: 'briefcase',
    category: 'Social',
    defaultProps: { logos: [], grayscale: true },
  },
  newsletter: {
    label: 'Newsletter',
    description: 'Email signup form',
    icon: 'inbox',
    category: 'Forms',
    defaultProps: { heading: '', description: '', buttonText: 'Subscribe' },
  },
  comparison: {
    label: 'Comparison Table',
    description: 'Feature comparison chart',
    icon: 'table',
    category: 'Content',
    defaultProps: { heading: '', items: [], features: [] },
  },
  'property-search': {
    label: 'Property Search',
    description: 'Search and filter properties',
    icon: 'search',
    category: 'Real Estate',
    defaultProps: { filters: [], sortOptions: [] },
  },
  'property-grid': {
    label: 'Property Grid',
    description: 'Display properties in a grid',
    icon: 'home',
    category: 'Real Estate',
    defaultProps: { properties: [], columns: 3 },
  },
  'property-detail': {
    label: 'Property Detail',
    description: 'Detailed property information',
    icon: 'home-details',
    category: 'Real Estate',
    defaultProps: { propertyId: '', showGallery: true, showAmenities: true },
  },
  'booking-widget': {
    label: 'Booking Widget',
    description: 'Reservation and booking form',
    icon: 'calendar',
    category: 'Booking',
    defaultProps: { propertyId: '', checkIn: '', checkOut: '', guests: 2 },
  },
  'booking-confirmation': {
    label: 'Booking Confirmation',
    description: 'Reservation success message',
    icon: 'check-circle',
    category: 'Booking',
    defaultProps: { bookingId: '', propertyName: '', dates: {} },
  },
  custom: {
    label: 'Custom Block',
    description: 'User-defined custom component',
    icon: 'code',
    category: 'Advanced',
    defaultProps: { component: '', props: {} },
  },
};

export class BlockProvider implements AutocompleteProvider {
  readonly id = 'blocks';
  readonly name = 'Blocks';
  readonly supportedTypes = ['block'] as const;
  readonly priority = 100;
  
  canActivate(context: AutocompleteContext): boolean {
    // Activate for block insertion commands
    return context.query.startsWith('/') || context.query.startsWith('add ');
  }
  
  async getSuggestions(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>> {
    const query = context.query.replace(/^[\/]?add\s*/, '').toLowerCase().trim();
    
    const items: BlockAutocompleteItem[] = Object.entries(blockDefinitions).map(([type, def]) => ({
      id: `block-${type}`,
      type: 'block',
      label: def.label,
      description: def.description,
      icon: def.icon,
      category: def.category,
      priority: 50,
      data: {
        blockType: type as BlockType,
        defaultProps: def.defaultProps,
        preview: undefined,
        tags: [def.category.toLowerCase(), type.toLowerCase()],
      },
      metadata: {
        recent: false,
        favorite: false,
        aiGenerated: false,
      },
    }));
    
    if (!query) {
      return ok(items);
    }
    
    const matches = searchItems(items, query, undefined, 50);
    return ok(matches.map(m => m.item));
  }
}

// ---------------------------------------------------------------------------
// COMMAND PROVIDER
// ---------------------------------------------------------------------------

export interface EditorCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
  category: string;
  action: () => void | Promise<void>;
  predicate?: () => boolean;
}

export class CommandProvider implements AutocompleteProvider {
  readonly id = 'commands';
  readonly name = 'Commands';
  readonly supportedTypes = ['command'] as const;
  readonly priority = 90;
  
  private commands: EditorCommand[] = [];
  
  registerCommand(command: EditorCommand): void {
    this.commands.push(command);
  }
  
  registerCommands(commands: EditorCommand[]): void {
    this.commands.push(...commands);
  }
  
  canActivate(context: AutocompleteContext): boolean {
    // Activate for command palette (Cmd+Shift+P or Cmd+K)
    return true;
  }
  
  async getSuggestions(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>> {
    const query = context.query.toLowerCase().trim();
    
    const items: CommandAutocompleteItem[] = this.commands
      .filter(cmd => !cmd.predicate || cmd.predicate())
      .map(cmd => ({
        id: `cmd-${cmd.id}`,
        type: 'command',
        label: cmd.label,
        description: cmd.description,
        icon: cmd.icon,
        category: cmd.category,
        shortcut: cmd.shortcut,
        priority: 60,
        data: {
          commandId: cmd.id,
          action: cmd.action,
        },
        metadata: {
          recent: false,
          favorite: false,
          aiGenerated: false,
        },
      }));
    
    if (!query) {
      return ok(items.sort((a, b) => b.priority - a.priority));
    }
    
    const matches = searchItems(items, query, undefined, 30);
    return ok(matches.map(m => m.item));
  }
}

// ---------------------------------------------------------------------------
// AI PROVIDER
// ---------------------------------------------------------------------------

export class AIProvider implements AutocompleteProvider {
  readonly id = 'ai';
  readonly name = 'AI Suggestions';
  readonly supportedTypes = ['ai-suggestion'] as const;
  readonly priority = 80;
  
  private cache = new Map<string, AISuggestionItem[]>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  canActivate(context: AutocompleteContext): boolean {
    // Only activate when explicitly requested or for content blocks
    return context.trigger === 'ai-predict' || 
           (context.blockType === 'text' && context.query.length > 10);
  }
  
  async getSuggestions(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>> {
    const cacheKey = `${context.blockId}:${context.propertyName}:${context.query}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return ok(cached);
    }
    
    // TODO: Call AI API
    // For now, return mock suggestions
    const suggestions: AISuggestionItem[] = [
      {
        id: `ai-${Date.now()}-1`,
        type: 'ai-suggestion',
        label: 'Improve clarity',
        description: 'Rewrite for better readability',
        icon: 'sparkles',
        category: 'AI',
        priority: 70,
        data: {
          suggestionType: 'content',
          suggestedText: 'Improved version of your text...',
          confidence: 0.85,
          reasoning: 'Simplifies complex sentences',
        },
        metadata: {
          recent: false,
          favorite: false,
          aiGenerated: true,
        },
      },
      {
        id: `ai-${Date.now()}-2`,
        type: 'ai-suggestion',
        label: 'Add headline',
        description: 'Generate engaging headline',
        icon: 'sparkles',
        category: 'AI',
        priority: 65,
        data: {
          suggestionType: 'content',
          suggestedText: 'Compelling Headline Here',
          confidence: 0.78,
          reasoning: 'Matches content tone',
        },
        metadata: {
          recent: false,
          favorite: false,
          aiGenerated: true,
        },
      },
    ];
    
    // Cache results
    this.cache.set(cacheKey, suggestions);
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTTL);
    
    return ok(suggestions);
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

// ---------------------------------------------------------------------------
// SNIPPET PROVIDER
// ---------------------------------------------------------------------------

interface Snippet {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  content: string;
  variables: string[];
}

export class SnippetProvider implements AutocompleteProvider {
  readonly id = 'snippets';
  readonly name = 'Snippets';
  readonly supportedTypes = ['snippet'] as const;
  readonly priority = 70;
  
  private snippets: Snippet[] = [
    {
      id: 'lorem-short',
      label: 'Lorem Ipsum (Short)',
      description: 'Short placeholder text',
      icon: 'text',
      category: 'Text',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      variables: [],
    },
    {
      id: 'lorem-medium',
      label: 'Lorem Ipsum (Medium)',
      description: 'Medium placeholder text',
      icon: 'text',
      category: 'Text',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      variables: [],
    },
    {
      id: 'cta-button',
      label: 'CTA Button',
      description: 'Call-to-action button HTML',
      icon: 'code',
      category: 'HTML',
      content: '<a href="${link}" class="btn btn-primary">${text}</a>',
      variables: ['link', 'text'],
    },
    {
      id: 'email-link',
      label: 'Email Link',
      description: 'Mailto link',
      icon: 'mail',
      category: 'HTML',
      content: '<a href="mailto:${email}">${text}</a>',
      variables: ['email', 'text'],
    },
    {
      id: 'phone-link',
      label: 'Phone Link',
      description: 'Tel link',
      icon: 'phone',
      category: 'HTML',
      content: '<a href="tel:${phone}">${text}</a>',
      variables: ['phone', 'text'],
    },
  ];
  
  canActivate(context: AutocompleteContext): boolean {
    return context.query.startsWith('!') || context.query.includes('snippet');
  }
  
  async getSuggestions(context: AutocompleteContext): Promise<Result<readonly AutocompleteItem[], Error>> {
    const query = context.query.replace(/^!/, '').toLowerCase().trim();
    
    const items: AutocompleteItem[] = this.snippets.map(snippet => ({
      id: `snippet-${snippet.id}`,
      type: 'snippet',
      label: snippet.label,
      description: snippet.description,
      icon: snippet.icon,
      category: snippet.category,
      priority: 40,
      data: {
        snippetId: snippet.id,
        content: snippet.content,
        variables: snippet.variables,
      },
      metadata: {
        recent: false,
        favorite: false,
        aiGenerated: false,
      },
    }));
    
    if (!query) {
      return ok(items);
    }
    
    const matches = searchItems(items, query, undefined, 20);
    return ok(matches.map(m => m.item));
  }
}

// ---------------------------------------------------------------------------
// PRE-CONFIGURED INSTANCES
// ---------------------------------------------------------------------------

export const blockProvider = new BlockProvider();
export const commandProvider = new CommandProvider();
export const aiProvider = new AIProvider();
export const snippetProvider = new SnippetProvider();

// Default commands
export const defaultCommands: EditorCommand[] = [
  {
    id: 'save',
    label: 'Save Page',
    description: 'Save current page changes',
    icon: 'save',
    shortcut: 'Cmd+S',
    category: 'File',
    action: () => console.log('Save command'),
  },
  {
    id: 'publish',
    label: 'Publish Page',
    description: 'Publish page to live site',
    icon: 'upload',
    shortcut: 'Cmd+Shift+P',
    category: 'File',
    action: () => console.log('Publish command'),
  },
  {
    id: 'preview',
    label: 'Preview Mode',
    description: 'Toggle preview mode',
    icon: 'eye',
    shortcut: 'Cmd+P',
    category: 'View',
    action: () => console.log('Preview command'),
  },
  {
    id: 'undo',
    label: 'Undo',
    description: 'Undo last action',
    icon: 'undo',
    shortcut: 'Cmd+Z',
    category: 'Edit',
    action: () => console.log('Undo command'),
  },
  {
    id: 'redo',
    label: 'Redo',
    description: 'Redo last undone action',
    icon: 'redo',
    shortcut: 'Cmd+Shift+Z',
    category: 'Edit',
    action: () => console.log('Redo command'),
  },
  {
    id: 'delete-block',
    label: 'Delete Block',
    description: 'Remove selected block',
    icon: 'trash',
    shortcut: 'Delete',
    category: 'Edit',
    action: () => console.log('Delete command'),
  },
  {
    id: 'duplicate-block',
    label: 'Duplicate Block',
    description: 'Duplicate selected block',
    icon: 'copy',
    shortcut: 'Cmd+D',
    category: 'Edit',
    action: () => console.log('Duplicate command'),
  },
  {
    id: 'move-up',
    label: 'Move Block Up',
    description: 'Move selected block up',
    icon: 'arrow-up',
    shortcut: 'Cmd+Up',
    category: 'Edit',
    action: () => console.log('Move up command'),
  },
  {
    id: 'move-down',
    label: 'Move Block Down',
    description: 'Move selected block down',
    icon: 'arrow-down',
    shortcut: 'Cmd+Down',
    category: 'Edit',
    action: () => console.log('Move down command'),
  },
  {
    id: 'add-block',
    label: 'Add Block',
    description: 'Insert new block',
    icon: 'plus',
    shortcut: 'Cmd+/',
    category: 'Insert',
    action: () => console.log('Add block command'),
  },
  {
    id: 'ai-generate',
    label: 'AI Generate',
    description: 'Generate content with AI',
    icon: 'sparkles',
    shortcut: 'Cmd+Shift+A',
    category: 'AI',
    action: () => console.log('AI generate command'),
  },
];

// Register default commands
commandProvider.registerCommands(defaultCommands);
