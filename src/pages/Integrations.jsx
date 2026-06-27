import React, { useEffect, useState } from 'react';
import { verifyToken, buildOAuthUrl } from '../services/metaApi';
import { verifyGoogleToken, buildGoogleOAuthUrl } from '../services/googleApi';
import { verifyTikTokToken, buildTikTokOAuthUrl } from '../services/tiktokApi';
import { loadPlatforms, savePlatform, disconnectPlatform } from '../services/platformsStore';
import './Integrations.css';
/* eslint-disable react/prop-types */

const REDIRECT = 'http://localhost:5173';

/* ─── كارت منصة واحدة ──────────────────────────────────────────────────── */
function PlatformCard({ id, logo, title, color, fields, data, onConnect, onDisconnect, busy }) {
  const [form, setForm] = useState({});
  const isConnected = data.status === 'connected';

  useEffect(() => {
    const init = {};
    fields.forEach((f) => { init[f.key] = data[f.key] || ''; });
    setForm(init);
  }, [data]); // eslint-disable-line

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className={`plat-card ${isConnected ? 'plat-card--connected' : ''}`}>
      {/* header */}
      <div className="plat-header">
        <div className="plat-logo" style={{ background: color }}>{logo}</div>
        <div className="plat-info">
          <div className="plat-title">{title}</div>
          <div className={`plat-status ${isConnected ? 'status-on' : 'status-off'}`}>
            {isConnected ? '● متصل' : '○ غير متصل'}
          </div>
        </div>
        {isConnected && (
          <button className="btn btn-ghost plat-disconnect" onClick={() => onDisconnect(id)}>
            قطع الاتصال
          </button>
        )}
      </div>

      {/* account info when connected */}
      {isConnected && (
        <div className="plat-account">
          <span className="plat-account-name">✅ {data.accountName}</span>
          {(data.accountId || data.customerId || data.advertiserId) && (
            <span className="plat-account-id">
              ID: {data.accountId || data.customerId || data.advertiserId}
            </span>
          )}
        </div>
      )}

      {/* form when disconnected */}
      {!isConnected && (
        <div className="plat-form">
          {fields.map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                type={f.secret ? 'password' : 'text'}
                value={form[f.key] || ''}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </label>
          ))}
          <div className="plat-actions">
            <button
              className="btn btn-primary"
              disabled={busy === id}
              onClick={() => onConnect(id, form)}
            >
              {busy === id ? '⏳ جارٍ التحقق...' : '🔗 ربط الحساب'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                const url = buildAuthUrl(id, form);
                if (url) window.electronAPI?.openExternal(url);
              }}
            >
              🌐 OAuth
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildAuthUrl(platform, form) {
  if (platform === 'meta')   return buildOAuthUrl(form.appId, REDIRECT);
  if (platform === 'google') return buildGoogleOAuthUrl(form.clientId, REDIRECT);
  if (platform === 'tiktok') return buildTikTokOAuthUrl(form.appId, REDIRECT);
  return null;
}

/* ─── الصفحة الرئيسية ──────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    id: 'meta',
    logo: 'f',
    title: 'Meta Ads',
    color: '#1877F2',
    fields: [
      { key: 'appId',       label: 'App ID',       placeholder: '1234567890' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'EAAxxxxx...', secret: true },
    ],
  },
  {
    id: 'google',
    logo: 'G',
    title: 'Google Ads',
    color: '#EA4335',
    fields: [
      { key: 'clientId',    label: 'Client ID',    placeholder: 'xxxx.apps.googleusercontent.com' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'ya29.xxx...', secret: true },
    ],
  },
  {
    id: 'tiktok',
    logo: '♪',
    title: 'TikTok Ads',
    color: '#010101',
    fields: [
      { key: 'appId',       label: 'App ID',       placeholder: '7xxxxxxxxxx' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'xxx...', secret: true },
    ],
  },
];

export default function Integrations() {
  const [platforms, setPlatforms] = useState(() => loadPlatforms());
  const [busy, setBusy]           = useState(null);   // platform id
  const [error, setError]         = useState({});     // { [id]: message }

  const refresh = () => setPlatforms(loadPlatforms());

  const handleConnect = async (id, form) => {
    setError((e) => ({ ...e, [id]: '' }));
    setBusy(id);
    try {
      let account = {};

      if (id === 'meta') {
        if (!form.appId?.trim() || !form.accessToken?.trim())
          throw new Error('أدخل App ID والـ Token');
        const res = await verifyToken(form.accessToken);
        account = { accountName: res.name, accountId: res.id };
        savePlatform('meta', { ...form, ...account, status: 'connected' });
      }

      if (id === 'google') {
        if (!form.clientId?.trim() || !form.accessToken?.trim())
          throw new Error('أدخل Client ID والـ Token');
        const res = await verifyGoogleToken(form.accessToken);
        account = { accountName: res.name, customerId: res.email };
        savePlatform('google', { ...form, ...account, status: 'connected' });
      }

      if (id === 'tiktok') {
        if (!form.appId?.trim() || !form.accessToken?.trim())
          throw new Error('أدخل App ID والـ Token');
        const res = await verifyTikTokToken(form.accessToken);
        account = { accountName: res.name, advertiserId: res.advertiserId };
        savePlatform('tiktok', { ...form, ...account, status: 'connected' });
      }

      refresh();
    } catch (err) {
      setError((e) => ({ ...e, [id]: err.message }));
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = (id) => {
    disconnectPlatform(id);
    setError((e) => ({ ...e, [id]: '' }));
    refresh();
  };

  const connectedCount = Object.values(platforms).filter((p) => p.status === 'connected').length;

  return (
    <>
      <div className="page-header">
        <h2>ربط المنصات</h2>
        <p>وصّل حساباتك الإعلانية لإدارتها من مكان واحد</p>
      </div>

      {/* summary bar */}
      <div className="plat-summary">
        <div className="plat-summary-item">
          <span className="plat-summary-num">{connectedCount}</span>
          <span className="plat-summary-label">منصة مرتبطة</span>
        </div>
        <div className="plat-summary-item">
          <span className="plat-summary-num">{3 - connectedCount}</span>
          <span className="plat-summary-label">غير مرتبطة</span>
        </div>
        <div className="plat-summary-note">
          الـ Tokens محفوظة محلياً على جهازك فقط — لا ترسل لأي خادم.
        </div>
      </div>

      {/* platform cards */}
      <div className="plat-grid">
        {PLATFORMS.map((p) => (
          <div key={p.id}>
            <PlatformCard
              {...p}
              data={platforms[p.id]}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              busy={busy}
            />
            {error[p.id] && (
              <div className="plat-error">⚠ {error[p.id]}</div>
            )}
          </div>
        ))}
      </div>

      {/* setup guide */}
      <div className="plat-guide">
        <div className="card-title">📋 خطوات الربط</div>
        <div className="plat-guide-grid">
          <div className="plat-guide-step">
            <div className="plat-guide-logo" style={{ background: '#1877F2' }}>f</div>
            <div>
              <strong>Meta Ads</strong>
              <ol>
                <li>اذهب لـ <a href="#" onClick={() => window.electronAPI?.openExternal('https://developers.facebook.com/apps')}>Meta for Developers</a></li>
                <li>أنشئ تطبيق → Marketing API</li>
                <li>أضف <code>http://localhost:5173</code> كـ Redirect URI</li>
                <li>انسخ App ID والـ Token هنا</li>
              </ol>
            </div>
          </div>

          <div className="plat-guide-step">
            <div className="plat-guide-logo" style={{ background: '#EA4335' }}>G</div>
            <div>
              <strong>Google Ads</strong>
              <ol>
                <li>اذهب لـ <a href="#" onClick={() => window.electronAPI?.openExternal('https://console.cloud.google.com')}>Google Cloud Console</a></li>
                <li>فعّل Google Ads API</li>
                <li>أنشئ OAuth 2.0 Client ID (Web application)</li>
                <li>أضف <code>http://localhost:5173</code> كـ Authorized URI</li>
              </ol>
            </div>
          </div>

          <div className="plat-guide-step">
            <div className="plat-guide-logo" style={{ background: '#010101' }}>♪</div>
            <div>
              <strong>TikTok Ads</strong>
              <ol>
                <li>اذهب لـ <a href="#" onClick={() => window.electronAPI?.openExternal('https://business-api.tiktok.com')}>TikTok for Business</a></li>
                <li>أنشئ تطبيق في Developer Portal</li>
                <li>أضف <code>http://localhost:5173</code> كـ Redirect URI</li>
                <li>انسخ App ID والـ Token هنا</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
