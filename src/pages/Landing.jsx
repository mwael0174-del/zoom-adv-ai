import React from 'react';
import './Landing.css';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: 'لوحة تحكم موحدة',
    desc: 'شوف كل حملاتك وميزانياتك ومؤشرات الأداء من Meta وTikTok وGoogle في مكان واحد.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'تتبع الميزانية',
    desc: 'رصد فوري للإنفاق مع تنبيهات لما الحملة تقترب من الحد. اعرف كل جنيه بيروح فين.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'أمان كامل',
    desc: 'التوكنز ما تطلعش من جهازك أبداً. تخزين محلي مشفر. بياناتك ملكك.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'سرعة Native',
    desc: 'تطبيق سطح مكتب حقيقي — تشغيل فوري، وصول offline، وصفر استهلاك من المتصفح.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    title: 'مساعد AI',
    desc: 'اسأل عن حملاتك بالعربي واحصل على اقتراحات ذكية للميزانية وأفضل أوقات النشر.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'تحليلات متقدمة',
    desc: 'رسوم بيانية واضحة لأداء كل منصة — CTR، الإنفاق، والمقارنة بين الحملات.',
  },
];

const PLATFORMS = [
  { icon: 'f', name: 'Meta Ads',    color: '#1877F2' },
  { icon: '♪', name: 'TikTok Ads', color: '#010101' },
  { icon: 'G', name: 'Google Ads', color: '#EA4335' },
  { icon: '📊', name: 'Analytics', color: '#34d399' },
  { icon: '+', name: 'قريباً',     color: '#6b7289' },
];

export default function Landing({ onStart }) {
  return (
    <div className="landing" dir="rtl">

      {/* ── HERO ── */}
      <section className="lnd-hero">
        <div className="lnd-glow" />
        <div className="lnd-badge">
          <span className="lnd-badge-dot" />
          متاح الآن على Windows — نسخة Beta مجانية
        </div>
        <h1 className="lnd-h1">
          أدِر كل إعلاناتك<br />
          <span className="lnd-accent">من مكان واحد.</span>
        </h1>
        <p className="lnd-sub">
          تطبيق واحد لحملات Meta وTikTok وGoogle Ads.
          تابع الميزانيات، حلّل الأداء، واستخدم AI — بدون فوضى.
        </p>
        <div className="lnd-actions">
          <button type="button" className="lnd-btn lnd-btn-primary" onClick={onStart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            ابدأ الآن — مجاناً
          </button>
          <a
            href="https://github.com/mwael0174-del/electron-app"
            target="_blank"
            rel="noreferrer"
            className="lnd-btn lnd-btn-ghost"
          >
            GitHub ↗
          </a>
        </div>
        <div className="lnd-platforms-row">
          {PLATFORMS.slice(0, 3).map((p) => (
            <span key={p.name} className="lnd-picon-wrap">
              <span className="lnd-picon" style={{ background: p.color }}>{p.icon}</span>
              {p.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── MOCKUP ── */}
      <section className="lnd-mockup-wrap">
        <div className="lnd-mockup">
          <div className="lnd-mockup-bar">
            <span className="lnd-dot" /><span className="lnd-dot" /><span className="lnd-dot" />
            <span className="lnd-mockup-title-bar">Zoom Adv AI</span>
          </div>
          <div className="lnd-mockup-body">
            <div className="lnd-mockup-sidebar">
              <div className="lnd-mnav active">▦ لوحة التحكم</div>
              <div className="lnd-mnav">◉ الحملات</div>
              <div className="lnd-mnav">AI مساعد AI</div>
              <div className="lnd-mnav">⌁ التحليلات</div>
              <div className="lnd-mnav">⇆ ربط المنصات</div>
            </div>
            <div className="lnd-mockup-main">
              <div className="lnd-mockup-header">
                <span className="lnd-mockup-page-title">لوحة التحكم</span>
                <span className="lnd-mockup-btn">+ حملة جديدة</span>
              </div>
              <div className="lnd-mockup-cards">
                <div className="lnd-mcard">
                  <div className="lnd-mcard-label">حملات نشطة</div>
                  <div className="lnd-mcard-value">7</div>
                </div>
                <div className="lnd-mcard">
                  <div className="lnd-mcard-label">إجمالي الميزانية</div>
                  <div className="lnd-mcard-value">24,500 ج.م</div>
                </div>
                <div className="lnd-mcard">
                  <div className="lnd-mcard-label">متوسط CTR</div>
                  <div className="lnd-mcard-value" style={{ color: 'var(--primary)' }}>3.4%</div>
                </div>
              </div>
              <div className="lnd-mockup-table">
                <div className="lnd-mrow"><span>حملة صيف 2026 — Meta</span><span className="lnd-ms active">نشطة</span></div>
                <div className="lnd-mrow"><span>إطلاق منتج — TikTok</span><span className="lnd-ms active">نشطة</span></div>
                <div className="lnd-mrow"><span>ترويج Instagram</span><span className="lnd-ms paused">متوقفة</span></div>
                <div className="lnd-mrow"><span>حملة رمضان — Google</span><span className="lnd-ms active">نشطة</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lnd-features">
        <div className="lnd-section-header">
          <h2>مصمم لمديري الإعلانات اللي بيكرهوا التشتت.</h2>
          <p>كل اللي تحتاجه لإدارة حملاتك عبر المنصات، من غير فوضى.</p>
        </div>
        <div className="lnd-features-grid">
          {FEATURES.map((f) => (
            <div className="lnd-feature" key={f.title}>
              <div className="lnd-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="lnd-integrations">
        <h2>وصّل منصاتك في ثوانٍ.</h2>
        <p>تسجيل دخول OAuth آمن — لا كلمات مرور محفوظة — نقرة واحدة للربط.</p>
        <div className="lnd-integration-logos">
          {PLATFORMS.map((p) => (
            <div className="lnd-integration-item" key={p.name}>
              <span className="lnd-int-icon" style={{ background: p.color }}>{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lnd-cta">
        <div className="lnd-glow lnd-glow-bottom" />
        <h2>وقّف التبديل بين التابات.<br />ابدأ تدير إعلاناتك.</h2>
        <p>مجاني خلال البيتا — Windows فقط (macOS قريباً).</p>
        <button type="button" className="lnd-btn lnd-btn-primary lnd-btn-lg" onClick={onStart}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          افتح التطبيق الآن
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lnd-footer">
        <span>© 2026 Zoom Adv AI — Zoom Design</span>
        <div className="lnd-footer-links">
          <a href="https://wa.me/2001205592861" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="https://facebook.com/ZoomDesignEgypt" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://github.com/mwael0174-del/electron-app" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>

    </div>
  );
}
