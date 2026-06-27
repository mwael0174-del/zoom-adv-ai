import { useEffect, useMemo, useState } from 'react';
import { verifyToken, buildOAuthUrl } from '../services/metaApi';

const STORAGE_KEY = 'zoom-adv-ai-meta';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function MetaConnect() {
  const [appId, setAppId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState('غير متصل');
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [busy, setBusy] = useState(false);

  const redirectUri = useMemo(() => 'http://localhost:5173', []);

  useEffect(() => {
    const saved = loadSettings();
    setAppId(saved.appId || '');
    setAccessToken(saved.accessToken || '');
    setStatus(saved.status || 'غير متصل');
    setAccountName(saved.accountName || '');
    setAccountId(saved.accountId || '');
  }, []);

  const isConnected = status === 'متصل';

  const connect = async () => {
    if (!appId.trim() || !accessToken.trim()) {
      setStatus('أدخل App ID والتوكن أولًا');
      return;
    }

    setBusy(true);
    setStatus('جارٍ التحقق...');

    try {
      const account = await verifyToken(accessToken);
      setStatus('متصل');
      setAccountName(account.name || 'Meta Account');
      setAccountId(account.id || '');

      saveSettings({
        appId,
        accessToken,
        status: 'متصل',
        accountName: account.name,
        accountId: account.id,
      });
    } catch (err) {
      setStatus(`تعذر الاتصال: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    saveSettings({ appId, accessToken, status, accountName, accountId });
    setStatus('تم حفظ الإعدادات محليًا');
  };

  const disconnect = () => {
    setStatus('غير متصل');
    setAccountName('');
    setAccountId('');
    saveSettings({ appId, accessToken: '', status: 'غير متصل', accountName: '', accountId: '' });
    setAccessToken('');
  };

  const openAuth = () => {
    if (!appId.trim()) {
      setStatus('أدخل App ID أولًا');
      return;
    }
    const url = buildOAuthUrl(appId, redirectUri);
    window.electronAPI?.openExternal(url);
    setStatus('تم فتح صفحة تسجيل الدخول في المتصفح');
  };

  return (
    <>
      <div className="page-header">
        <h2>ربط Meta</h2>
        <p>أدخل بيانات التطبيق وجرّب توثيق الحساب من داخل التطبيق.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">بيانات الربط</div>
          <div className="meta-form">
            <label>
              App ID
              <input
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1234567890"
                disabled={isConnected}
              />
            </label>
            <label>
              Access Token
              <input
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="ضع التوكن هنا"
                type="password"
                disabled={isConnected}
              />
            </label>
            <label>
              Redirect URI
              <input value={redirectUri} readOnly />
            </label>
          </div>
          <div className="meta-actions">
            {!isConnected ? (
              <>
                <button type="button" className="btn btn-primary" onClick={connect} disabled={busy}>
                  {busy ? 'جارٍ الفحص...' : '🔗 تحقق من الاتصال'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={save}>💾 حفظ</button>
                <button type="button" className="btn btn-ghost" onClick={openAuth}>🌐 فتح تسجيل الدخول</button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={disconnect}>
                🔌 قطع الاتصال
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">الحالة الحالية</div>
          <div className={`meta-status ${isConnected ? 'meta-status--connected' : ''}`}>
            {isConnected ? '✅ ' : '⚪ '}{status}
          </div>

          {accountName && (
            <div className="meta-detail" style={{ marginTop: 12 }}>
              <strong>الحساب:</strong> {accountName}
              {accountId && <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>({accountId})</span>}
            </div>
          )}

          {!accountName && (
            <div className="meta-detail">لم يتم ربط حساب بعد.</div>
          )}

          <div className="meta-note">
            للربط النهائي داخل Meta يجب إضافة App ID وRedirect URI داخل لوحة{' '}
            <strong>Meta for Developers</strong>.
            <br />
            الـ Access Token محفوظ مشفراً في localStorage.
          </div>
        </div>
      </div>
    </>
  );
}
