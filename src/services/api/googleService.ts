/**
 * Google Ads API Service
 * خدمة Google للتعامل مع Google Ads API
 */

import { googleClient } from './httpClient';
import { googleCampaignSchema, type GoogleCampaign } from '../schemas/api.schema';

export class GoogleService {
  /**
   * الحصول على الحملات
   */
  static async getCampaigns(customerId: string): Promise<GoogleCampaign[]> {
    const response = await googleClient.get<{ results: unknown[] }>(
      `/customers/${customerId}/campaigns`
    );

    if (!response.success) {
      throw new Error(`Google API Error: ${response.error}`);
    }

    const campaigns = response.data?.results || [];
    return campaigns.map((c) => googleCampaignSchema.parse(c));
  }

  /**
   * إنشاء حملة جديدة
   */
  static async createCampaign(
    customerId: string,
    name: string,
    budgetAmount: number
  ): Promise<GoogleCampaign> {
    const response = await googleClient.post<GoogleCampaign>(
      `/customers/${customerId}/campaigns`,
      {
        name,
        budget: {
          amount_micros: budgetAmount * 1000000,
          currency_code: 'USD',
        },
        status: 'PAUSED',
      }
    );

    if (!response.success) {
      throw new Error(`Google API Error: ${response.error}`);
    }

    return googleCampaignSchema.parse(response.data);
  }

  /**
   * تحديث حالة الحملة
   */
  static async updateCampaignStatus(
    customerId: string,
    campaignId: string,
    status: 'ENABLED' | 'PAUSED'
  ): Promise<void> {
    const response = await googleClient.put(
      `/customers/${customerId}/campaigns/${campaignId}`,
      { status }
    );

    if (!response.success) {
      throw new Error(`Google API Error: ${response.error}`);
    }
  }
}
