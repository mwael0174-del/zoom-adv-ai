/**
 * UI Store (Zustand)
 * مخزن واجهة المستخدم - إدارة حالات النوافذ والنماذج
 */

import { create } from 'zustand';

interface UIStore {
  showCampaignForm: boolean;
  showDeleteConfirm: number | null;
  activeModal: string | null;
  sidebarOpen: boolean;
  loading: boolean;
  notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null;

  // Actions
  toggleCampaignForm: () => void;
  openCampaignForm: () => void;
  closeCampaignForm: () => void;
  setDeleteConfirm: (id: number | null) => void;
  setActiveModal: (modal: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showCampaignForm: false,
  showDeleteConfirm: null,
  activeModal: null,
  sidebarOpen: true,
  loading: false,
  notification: null,

  toggleCampaignForm: () =>
    set((state) => ({ showCampaignForm: !state.showCampaignForm })),

  openCampaignForm: () => set({ showCampaignForm: true }),

  closeCampaignForm: () => set({ showCampaignForm: false }),

  setDeleteConfirm: (id: number | null) => set({ showDeleteConfirm: id }),

  setActiveModal: (modal: string | null) => set({ activeModal: modal }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  setLoading: (loading: boolean) => set({ loading }),

  showNotification: (type, message) =>
    set({ notification: { type, message } }),

  clearNotification: () => set({ notification: null }),
}));
