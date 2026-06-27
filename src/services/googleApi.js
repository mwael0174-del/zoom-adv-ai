/**
 * googleApi.js
 * Google Ads API integration
 *
 * ملاحظة: Google Ads API تتطلب OAuth 2.0 server-side.
 * هنا نوفر رابط الـ OAuth وverification للـ token عبر Google OAuth2 API.
 */

const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2';
const GOOGLE_TOKEN_INFO  = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

/**
 * بناء رابط OAuth لـ Google Ads
 * @param {string} clientId
 * @param {string} redirectUri
 */
export function buildGoogleOAuthUrl(clientId, redirectUri) {
  const url = new URL(`${GOOGLE_OAUTH_BASE}/auth`);
  url.searchParams.set('client_id', clientId.trim());
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('scope', [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' '));
  url.searchParams.set('include_granted_scopes', 'true');
  return url.toString();
}

/**
 * التحقق من الـ Access Token عبر Google tokeninfo endpoint
 * @param {string} accessToken
 * @returns {{ email: string, name: string }}
 */
export async function verifyGoogleToken(accessToken) {
  const res  = await fetch(`${GOOGLE_TOKEN_INFO}?access_token=${encodeURIComponent(accessToken.trim())}`);
  const data = await res.json();

  if (!res.ok || data.error_description) {
    throw new Error(data.error_description || 'Token غير صالح');
  }

  // جلب اسم المستخدم
  const profileRes  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken.trim()}` },
  });
  const profile = await profileRes.json();

  return {
    email: profile.email || data.email || '',
    name:  profile.name  || profile.email || 'Google Account',
  };
}
