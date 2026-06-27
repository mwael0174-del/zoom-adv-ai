/**
 * tiktokApi.js
 * TikTok for Business API integration
 *
 * الـ TikTok Marketing API تتطلب server-side OAuth.
 * هنا نوفر رابط الـ OAuth وverification للـ token.
 */

const TIKTOK_AUTH_BASE = 'https://business-api.tiktok.com/portal/auth';
const TIKTOK_API_BASE  = 'https://business-api.tiktok.com/open_api/v1.3';

/**
 * بناء رابط OAuth لـ TikTok for Business
 * @param {string} appId
 * @param {string} redirectUri
 */
export function buildTikTokOAuthUrl(appId, redirectUri) {
  const url = new URL(TIKTOK_AUTH_BASE);
  url.searchParams.set('app_id', appId.trim());
  url.searchParams.set('redirect_uri', encodeURIComponent(redirectUri));
  url.searchParams.set('state', 'zoom_adv_ai');
  return url.toString();
}

/**
 * التحقق من الـ Access Token عبر TikTok API
 * @param {string} accessToken
 * @returns {{ name: string, advertiserId: string }}
 */
export async function verifyTikTokToken(accessToken) {
  const res = await fetch(`${TIKTOK_API_BASE}/oauth2/advertiser/get/`, {
    headers: {
      'Access-Token': accessToken.trim(),
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    throw new Error(data.message || 'Token غير صالح أو منتهي الصلاحية');
  }

  const advertiser = data.data?.list?.[0];
  return {
    name:         advertiser?.advertiser_name || 'TikTok Account',
    advertiserId: advertiser?.advertiser_id   || '',
  };
}
