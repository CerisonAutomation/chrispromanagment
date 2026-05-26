import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: number;
}

interface UIState {
  sidebarOpen: boolean;
  activeAdminTab: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  notifications: Notification[];
  globalLoading: boolean;

  // actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveAdminTab: (tab: string) => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

let notifSeq = 0;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeAdminTab: 'dashboard',
  previewMode: 'desktop',
  notifications: [],
  globalLoading: false,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  setPreviewMode: (mode) => set({ previewMode: mode }),

  addNotification(n) {
    const notif: Notification = { ...n, id: String(++notifSeq), createdAt: Date.now() };
    set(s => ({ notifications: [notif, ...s.notifications].slice(0, 20) }));
    // auto-dismiss info/success after 5s
    if (n.type === 'info' || n.type === 'success') {
      setTimeout(() => set(s => ({ notifications: s.notifications.filter(x => x.id !== notif.id) })), 5000);
    }
  },

  dismissNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  clearNotifications: () => set({ notifications: [] }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
