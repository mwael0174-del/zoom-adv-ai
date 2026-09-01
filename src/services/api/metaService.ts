/**
 * Meta/Facebook Ads API Service
 * خدمة Meta للتعامل مع Facebook Ads API
 */

import { metaClient, type ApiResponse } from './httpClient';
import { metaCampaignSchema, type MetaCampaign } from '../schemas/api.schema';

export class MetaService {
  /**
   * الحصول على قائمة الحملات
   */
  static async getCampaigns(): Promise<MetaCampaign[]> {
    const response = await metaClient.get<{ data: unknown[] }>('/me/campaigns');

    if (!response.success) {
      throw new Error(`Meta API Error: ${response.error}`);
    }

    const campaigns = response.data?.data || [];
    return campaigns.map((c) => metaCampaignSchema.parse(c));
  }

  /**
   * إنشاء حملة جديدة
   */
  static async createCampaign(
    name: string,
    budget: number
  ): Promise<MetaCampaign> {
    const response = await metaClient.post<MetaCampaign>('/me/campaigns', {
      name,
      lifetime_budget: budget,
      status: 'PAUSED',
    });

    if (!response.success) {
      throw new Error(`Meta API Error: ${response.error}`);
    }

    return metaCampaignSchema.parse(response.data);
  }

  /**
   * تحديث حالة الحملة
   */
  static async updateCampaignStatus(
    campaignId: string,
    status: 'ACTIVE' | 'PAUSED'
  ): Promise<void> {
    const response = await metaClient.put(`/${campaignId}`, { status });

    if (!response.success) {
      throw new Error(`Meta API Error: ${response.error}`);
    }
  }

  /**
   * حذف حملة
   */
  static async deleteCampaign(campaignId: string): Promise<void> {
    const response = await metaClient.delete(`/${campaignId}`);

    if (!response.success) {
      throw new Error(`Meta API Error: ${response.error}`);
    }
  }
}
