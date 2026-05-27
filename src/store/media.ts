// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  tags?: string[];
  created_at: string;
}

interface MediaState {
  items: MediaItem[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  search: string;

  // derived
  filtered: () => MediaItem[];

  // actions
  fetch: () => Promise<void>;
  upload: (files: File[]) => Promise<void>;
  remove: (item: MediaItem) => Promise<void>;
  generateAI: (prompt?: string) => Promise<void>;
  setSearch: (q: string) => void;
  subscribeRealtime: () => () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  loading: false,
  uploading: false,
  error: null,
  search: '',

  filtered() {
    const q = get().search.toLowerCase();
    return q ? get().items.filter(i => i.name.toLowerCase().includes(q)) : get().items;
  },

  async fetch() {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) set({ error: error.message });
    else set({ items: (data as MediaItem[]) || [] });
    set({ loading: false });
  },

  async upload(files) {
    set({ uploading: true });
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: storageErr } = await supabase.storage.from('media').upload(path, file);
        if (storageErr) throw storageErr;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
        await supabase.from('media_library').insert({
          url: publicUrl,
          name: file.name.replace(/\.[^.]+$/, ''),
          file_type: file.type,
          file_size: file.size,
          storage_path: path,
        });
      }
      await get().fetch();
    } finally {
      set({ uploading: false });
    }
  },

  async remove(item) {
    if (item.storage_path) {
      await supabase.storage.from('media').remove([item.storage_path]);
    }
    const { error } = await supabase.from('media_library').delete().eq('id', item.id);
    if (error) throw error;
    set(s => ({ items: s.items.filter(i => i.id !== item.id) }));
  },

  async generateAI(prompt = 'Luxury Mediterranean villa in Malta with sea view at sunset, professional real estate photography') {
    const { data, error } = await supabase.functions.invoke('ai-generate-image', { body: { prompt } });
    if (error) throw error;
    if (data?.url) {
      await supabase.from('media_library').insert({
        url: data.url,
        name: 'AI Generated',
        file_type: 'image/png',
        file_size: null,
        storage_path: null,
      });
      await get().fetch();
    }
  },

  setSearch: (q) => set({ search: q }),

  subscribeRealtime() {
    const ch = supabase.channel('media-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_library' }, () => {
        get().fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  },
}));