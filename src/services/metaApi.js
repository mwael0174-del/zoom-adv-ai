/**
 * metaApi.js
 * كل calls لـ Meta Graph API في مكان واحد
 */

const GRAPH_BASE = 'https://graph.facebook.com';
const API_VERSION = 'v20.0';

/**
 * التحقق من صحة الـ Access Token وجلب بيانات الحساب
 * @param {string} accessToken
 * @returns {{ id: string, name: string }}
 */
export async function verifyToken(accessToken) {
  const url = `${GRAPH_BASE}/me?fields=id,name&access_token=${encodeURIComponent(accessToken.trim())}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'فشل التحقق من الـ Token');
  }

  return { id: data.id, name: data.name };
}

/**
 * بناء رابط OAuth للمصادقة
 * @param {string} appId
 * @param {string} redirectUri
 * @returns {string} - رابط صفحة التسجيل
 */
export function buildOAuthUrl(appId, redirectUri) {
  const url = new URL(`https://www.facebook.com/${API_VERSION}/dialog/oauth`);
  url.searchParams.set('client_id', appId.trim());
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set(
    'scope',
    'ads_read,ads_management,business_management,pages_read_engagement,pages_show_list,instagram_basic,instagram_manage_insights,read_insights'
  );
  return url.toString();
}

/**
 * جلب Ad Accounts للحساب (للاستخدام المستقبلي)
 * @param {string} accessToken
 */
export async function getAdAccounts(accessToken) {
  const url = `${GRAPH_BASE}/me/adaccounts?fields=id,name,account_status&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || 'فشل جلب الحسابات');
  return data.data || [];
}
