/**
 * TikTok Ads API Service
 * خدمة TikTok للتعامل مع TikTok Business API
 */

import { tiktokClient } from './httpClient';
import { tiktokCampaignSchema, type TiktokCampaign } from '../schemas/api.schema';

export class TiktokService {
  /**
   * الحصول على الحملات
   */
  static async getCampaigns(accountId: string): Promise<TiktokCampaign[]> {
    const response = await tiktokClient.get<{ data: { list: unknown[] } }>(
      `/campaign/get/?advertiser_id=${accountId}`
    );

    if (!response.success) {
      throw new Error(`TikTok API Error: ${response.error}`);
    }

    const campaigns = response.data?.data?.list || [];
    return campaigns.map((c) => tiktokCampaignSchema.parse(c));
  }

  /**
   * إنشاء حملة جديدة
   */
  static async createCampaign(
    accountId: string,
    name: string,
    budget: number
  ): Promise<TiktokCampaign> {
    const response = await tiktokClient.post<{ data: TiktokCampaign }>(
      '/campaign/create/',
      {
        advertiser_id: accountId,
        campaign_name: name,
        campaign_type: 'REGULAR',
        budget,
        objective_type: 'CONVERSIONS',
      }
    );

    if (!response.success) {
      throw new Error(`TikTok API Error: ${response.error}`);
    }

    return tiktokCampaignSchema.parse(response.data?.data);
  }

  /**
   * تحديث حالة الحملة
   */
  static async updateCampaignStatus(
    accountId: string,
    campaignId: string,
    status: 'CAMPAIGN_STATUS_ENABLE' | 'CAMPAIGN_STATUS_DISABLE'
  ): Promise<void> {
    const response = await tiktokClient.put('/campaign/update/', {
      advertiser_id: accountId,
      campaign_id: campaignId,
      campaign_status: status,
    });

    if (!response.success) {
      throw new Error(`TikTok API Error: ${response.error}`);
    }
  }
}
