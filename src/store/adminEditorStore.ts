import { create } from 'zustand'

interface AdminEditorState {
  selectedBlockId: string | null
  previewMode: boolean
  viewport: 'desktop' | 'tablet' | 'mobile'
  isGenerating: boolean
  generationPrompt: string
  activeTab: string
  setSelectedBlockId: (id: string | null) => void
  setPreviewMode: (mode: boolean) => void
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void
  setGenerating: (g: boolean) => void
  setGenerationPrompt: (p: string) => void
  setActiveTab: (tab: string) => void
  clearGeneration: () => void
}

export const useAdminEditorStore = create<AdminEditorState>()((set) => ({
  selectedBlockId: null,
  previewMode: false,
  viewport: 'desktop',
  isGenerating: false,
  generationPrompt: '',
  activeTab: 'overview',

  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setViewport: (v) => set({ viewport: v }),
  setGenerating: (g) => set({ isGenerating: g }),
  setGenerationPrompt: (p) => set({ generationPrompt: p }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  clearGeneration: () => set({ isGenerating: false, generationPrompt: '' }),
}))
