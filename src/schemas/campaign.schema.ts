/**
 * Campaign Validation Schema (Zod)
 * مخطط التحقق من صحة بيانات الحملات
 */

import { z } from 'zod';

export const platformEnum = z.enum(['Facebook', 'Google', 'Instagram', 'TikTok']);

export const campaignFormSchema = z.object({
  name: z
    .string()
    .min(3, 'اسم الحملة يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'اسم الحملة لا يجب أن يتجاوز 100 حرف'),
  platform: platformEnum,
  budget: z
    .number()
    .min(100, 'الميزانية الأدنى 100 جنيه')
    .max(10000000, 'الميزانية القصوى 10 مليون جنيه'),
});

export const campaignFullSchema = campaignFormSchema.extend({
  id: z.number(),
  spent: z.number().min(0),
  ctr: z.number().min(0).max(100),
  status: z.enum(['active', 'paused', 'draft']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CampaignFormInput = z.infer<typeof campaignFormSchema>;
export type Campaign = z.infer<typeof campaignFullSchema>;
