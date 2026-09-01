/**
 * Campaign Data Types
 * أنواع البيانات الخاصة بالحملات الإعلانية
 */

export type CampaignStatus = 'active' | 'paused' | 'draft';
export type Platform = 'Facebook' | 'Google' | 'Instagram' | 'TikTok';

export interface Campaign {
  id: number;
  name: string;
  platform: Platform;
  budget: number;
  spent: number;
  ctr: number;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignFormData {
  name: string;
  platform: Platform;
  budget: number;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  platform?: Platform;
  searchTerm?: string;
}
