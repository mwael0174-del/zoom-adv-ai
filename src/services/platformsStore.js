/**
 * platformsStore.js
 * حفظ وتحميل بيانات ربط المنصات من localStorage
 */

const KEY = 'zoom-adv-ai-platforms';

const DEFAULTS = {
  meta:   { accessToken: '', appId: '',        status: 'disconnected', accountName: '', accountId: '' },
  google: { accessToken: '', clientId: '',      status: 'disconnected', accountName: '', customerId: '' },
  tiktok: { accessToken: '', appId: '',        status: 'disconnected', accountName: '', advertiserId: '' },
};

export function loadPlatforms() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function savePlatform(platform, data) {
  const all = loadPlatforms();
  all[platform] = { ...all[platform], ...data };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function disconnectPlatform(platform) {
  savePlatform(platform, { ...DEFAULTS[platform] });
}
