/**
 * CampaignsContext.jsx
 * React Context لمشاركة بيانات الحملات بين جميع الصفحات
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  addCampaign as storeAdd,
  deleteCampaign as storeDelete,
  getCampaigns,
  updateCampaign as storeUpdate,
  updateCampaignStatus as storeUpdateStatus,
} from '../store/campaignsStore';

const CampaignsContext = createContext(null);

export function CampaignsProvider({ children }) {
  const [campaigns, setCampaigns] = useState(() => getCampaigns());

  const refresh = useCallback(() => {
    setCampaigns(getCampaigns());
  }, []);

  const addCampaign = useCallback((data) => {
    storeAdd(data);
    refresh();
  }, [refresh]);

  const updateStatus = useCallback((id, status) => {
    storeUpdateStatus(id, status);
    refresh();
  }, [refresh]);

  const deleteCampaign = useCallback((id) => {
    storeDelete(id);
    refresh();
  }, [refresh]);

  const updateCampaign = useCallback((id, updates) => {
    storeUpdate(id, updates);
    refresh();
  }, [refresh]);

  return (
    <CampaignsContext.Provider
      value={{ campaigns, addCampaign, updateStatus, deleteCampaign, updateCampaign, refresh }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

/** Hook للوصول لبيانات الحملات من أي مكون */
export function useCampaigns() {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error('useCampaigns يجب استخدامه داخل CampaignsProvider');
  return ctx;
}
