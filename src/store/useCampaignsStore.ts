/**
 * Campaigns Store (Zustand)
 * مخزن الحملات - إدارة حالة الحملات بشكل مركزي
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, CampaignFormData, CampaignStatus } from '../types/campaign';

interface CampaignsStore {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;

  // Actions
  addCampaign: (data: CampaignFormData) => void;
  updateCampaign: (id: number, data: Partial<CampaignFormData>) => void;
  deleteCampaign: (id: number) => void;
  updateStatus: (id: number, status: CampaignStatus) => void;
  getCampaignById: (id: number) => Campaign | undefined;
  resetCampaigns: () => void;
  setError: (error: string | null) => void;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'حملة Facebook الصيفية',
    platform: 'Facebook',
    budget: 5000,
    spent: 3200,
    ctr: 2.5,
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'حملة Google Ads',
    platform: 'Google',
    budget: 10000,
    spent: 7500,
    ctr: 3.8,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export const useCampaignsStore = create<CampaignsStore>()
  (persist(
    (set, get) => ({
      campaigns: MOCK_CAMPAIGNS,
      loading: false,
      error: null,

      addCampaign: (data: CampaignFormData) => {
        const newCampaign: Campaign = {
          id: Date.now(),
          ...data,
          spent: 0,
          ctr: 0,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
          error: null,
        }));
      },

      updateCampaign: (id: number, data: Partial<CampaignFormData>) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
          error: null,
        }));
      },

      deleteCampaign: (id: number) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          error: null,
        }));
      },

      updateStatus: (id: number, status: CampaignStatus) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date() } : c
          ),
          error: null,
        }));
      },

      getCampaignById: (id: number) => {
        return get().campaigns.find((c) => c.id === id);
      },

      resetCampaigns: () => {
        set({ campaigns: MOCK_CAMPAIGNS, error: null });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'campaigns-store',
      version: 1,
    }
  ));
