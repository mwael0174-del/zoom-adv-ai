/**
 * campaignsStore.js
 * إدارة بيانات الحملات مع persistence في localStorage
 */

const STORAGE_KEY = 'zoom-adv-ai-campaigns';

const DEFAULT_CAMPAIGNS = [
  { id: 1, name: 'حملة صيف 2026', platform: 'Facebook', budget: 5000, spent: 3200, status: 'active', ctr: 3.2 },
  { id: 2, name: 'إطلاق منتج جديد', platform: 'Google Ads', budget: 8000, spent: 4100, status: 'active', ctr: 2.8 },
  { id: 3, name: 'ترويج Instagram', platform: 'Instagram', budget: 3000, spent: 1800, status: 'paused', ctr: 4.1 },
  { id: 4, name: 'حملة رمضان', platform: 'TikTok', budget: 6000, spent: 0, status: 'draft', ctr: 0 },
];

export const PLATFORMS = ['Facebook', 'Google Ads', 'Instagram', 'TikTok', 'Twitter/X', 'LinkedIn'];

// ─── helpers ────────────────────────────────────────────────────────────────

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function save(campaigns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.warn('تعذر حفظ الحملات:', e);
  }
}

function getNextId(campaigns) {
  return campaigns.length > 0 ? Math.max(...campaigns.map((c) => c.id)) + 1 : 1;
}

// ─── initialise once ─────────────────────────────────────────────────────────

let _campaigns = load() ?? [...DEFAULT_CAMPAIGNS];

// ─── public API ──────────────────────────────────────────────────────────────

export function getCampaigns() {
  return [..._campaigns];
}

export function addCampaign(data) {
  const campaign = {
    id: getNextId(_campaigns),
    spent: 0,
    ctr: 0,
    status: 'draft',
    ...data,
  };
  _campaigns.unshift(campaign);
  save(_campaigns);
  return campaign;
}

export function updateCampaignStatus(id, status) {
  const c = _campaigns.find((x) => x.id === id);
  if (c) {
    c.status = status;
    save(_campaigns);
  }
}

export function deleteCampaign(id) {
  _campaigns = _campaigns.filter((c) => c.id !== id);
  save(_campaigns);
}

export function updateCampaign(id, updates) {
  const idx = _campaigns.findIndex((c) => c.id === id);
  if (idx !== -1) {
    _campaigns[idx] = { ..._campaigns[idx], ...updates };
    save(_campaigns);
  }
}

/** إعادة ضبط البيانات للقيم الافتراضية (للاختبار) */
export function resetCampaigns() {
  _campaigns = [...DEFAULT_CAMPAIGNS];
  save(_campaigns);
}
