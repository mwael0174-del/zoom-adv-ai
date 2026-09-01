/**
 * useCampaigns Hook
 * Hook مخصص لاستخدام مخزن الحملات
 */

import { useCampaignsStore } from '@/store/useCampaignsStore';
import { useUIStore } from '@/store/useUIStore';
import { campaignFormSchema } from '@/schemas/campaign.schema';
import { safeParse } from '@/utils/validation';
import type { CampaignFormInput } from '@/schemas/campaign.schema';

export function useCampaigns() {
  const store = useCampaignsStore();
  const ui = useUIStore();

  const handleAddCampaign = async (data: unknown) => {
    const validation = safeParse(campaignFormSchema, data);

    if (!validation.success) {
      ui.showNotification('error', 'بيانات غير صحيحة');
      return false;
    }

    try {
      ui.setLoading(true);
      store.addCampaign(validation.data as CampaignFormInput);
      ui.showNotification('success', 'تم إنشاء الحملة بنجاح');
      ui.closeCampaignForm();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطأ غير متوقع';
      ui.showNotification('error', message);
      return false;
    } finally {
      ui.setLoading(false);
    }
  };

  const handleDeleteCampaign = (id: number) => {
    try {
      store.deleteCampaign(id);
      ui.showNotification('success', 'تم حذف الحملة بنجاح');
      ui.setDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطأ غير متوقع';
      ui.showNotification('error', message);
    }
  };

  const handleUpdateStatus = (id: number, status: 'active' | 'paused') => {
    try {
      store.updateStatus(id, status);
      ui.showNotification(
        'success',
        status === 'active' ? 'تم تشغيل الحملة' : 'تم إيقاف الحملة'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطأ غير متوقع';
      ui.showNotification('error', message);
    }
  };

  return {
    campaigns: store.campaigns,
    loading: ui.loading,
    error: store.error,
    showForm: ui.showCampaignForm,
    handleAddCampaign,
    handleDeleteCampaign,
    handleUpdateStatus,
    toggleForm: ui.toggleCampaignForm,
    closeForm: ui.closeCampaignForm,
  };
}
