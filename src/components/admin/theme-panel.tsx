'use client';

import React from 'react';
import {useEditorStore} from '@/store/editor-store';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Check, Layout, Palette, Sparkles} from 'lucide-react';
import {cn} from '@/lib/utils';

// =============================================================================
// PRESET THEMES
// =============================================================================

const presetThemes = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional, blue accents',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      accent: '#f8fafc',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Sleek dark theme with vibrant accents',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      accent: '#334155',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Cozy, approachable with warm tones',
    colors: {
      primary: '#f97316',
      secondary: '#78716c',
      background: '#fff7ed',
      foreground: '#1c1917',
      muted: '#fed7aa',
      accent: '#ffedd5',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated with serif typography',
    colors: {
      primary: '#1e293b',
      secondary: '#64748b',
      background: '#fafaf9',
      foreground: '#1c1917',
      muted: '#f5f5f4',
      accent: '#e7e5e4',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold, energetic with bright colors',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      background: '#ffffff',
      foreground: '#18181b',
      muted: '#f5f3ff',
      accent: '#fce7f3',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
  },
];

// =============================================================================
// THEME PANEL COMPONENT
// =============================================================================

export function ThemePanel() {
  const { currentTheme, setTheme } = useEditorStore();
  const [activeTab, setActiveTab] = React.useState<'presets' | 'custom'>('presets');
  const [customColors, setCustomColors] = React.useState({
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    foreground: '#0f172a',
  });

  const applyTheme = (theme: typeof presetThemes[0]) => {
    setTheme({
      id: theme.id,
      name: theme.name,
      colors: theme.colors,
      fonts: theme.fonts,
    });

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--accent', theme.colors.accent);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Theme Studio</h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Customize your site appearance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('presets')}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-medium transition-colors",
            activeTab === 'presets'
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-medium transition-colors",
            activeTab === 'custom'
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          Custom
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'presets' ? (
          <div className="space-y-3">
            {presetThemes.map((theme) => {
              const isActive = currentTheme?.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{theme.name}</span>
                        {isActive && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {theme.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-neutral-500" />
                <h3 className="text-sm font-medium">Colors</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Primary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                      className="w-8 h-8 p-0 border-0"
                    />
                    <span className="text-xs text-neutral-500 w-16 font-mono">
                      {customColors.primary}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Secondary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                      className="w-8 h-8 p-0 border-0"
                    />
                    <span className="text-xs text-neutral-500 w-16 font-mono">
                      {customColors.secondary}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                      className="w-8 h-8 p-0 border-0"
                    />
                    <span className="text-xs text-neutral-500 w-16 font-mono">
                      {customColors.background}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Text</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.foreground}
                      onChange={(e) => setCustomColors({ ...customColors, foreground: e.target.value })}
                      className="w-8 h-8 p-0 border-0"
                    />
                    <span className="text-xs text-neutral-500 w-16 font-mono">
                      {customColors.foreground}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-4"
                onClick={() => {
                  applyTheme({
                    id: 'custom',
                    name: 'Custom',
                    description: 'Your custom theme',
                    colors: {
                      primary: customColors.primary,
                      secondary: customColors.secondary,
                      background: customColors.background,
                      foreground: customColors.foreground,
                      muted: customColors.background,
                      accent: customColors.background,
                    },
                    fonts: { heading: 'Inter', body: 'Inter' },
                  });
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Custom Theme
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Current Theme Footer */}
      {currentTheme && (
        <div className="p-3 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500">Current Theme</p>
              <p className="text-sm font-medium">{currentTheme.name}</p>
            </div>
            <div className="flex gap-1">
              <div
                className="w-5 h-5 rounded-full border"
                style={{ backgroundColor: currentTheme.colors?.primary ?? '#3b82f6' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
