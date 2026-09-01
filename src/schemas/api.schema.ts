/**
 * API Response Validation Schemas (Zod)
 * مخططات التحقق من ردود API
 */

import { z } from 'zod';

// Meta API Response
export const metaCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']),
  lifetime_budget: z.number().optional(),
  daily_budget: z.number().optional(),
});

export type MetaCampaign = z.infer<typeof metaCampaignSchema>;

// Google Ads API Response
export const googleCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ENABLED', 'PAUSED', 'REMOVED']),
  budget: z.object({
    amount_micros: z.number(),
    currency_code: z.string(),
  }),
});

export type GoogleCampaign = z.infer<typeof googleCampaignSchema>;

// TikTok Ads API Response
export const tiktokCampaignSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  campaign_status: z.enum(['CAMPAIGN_STATUS_ENABLE', 'CAMPAIGN_STATUS_DISABLE']),
  budget: z.number().optional(),
});

export type TiktokCampaign = z.infer<typeof tiktokCampaignSchema>;

// Generic API Error Response
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  status: z.number().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
