import { useMemo, useState } from 'react';
import { useCampaigns } from '../context/CampaignsContext';
import {
  behavioralSegments,
  geoActivity,
  predictAudience,
  microInterests,
  timeHeatmap,
  deviceBreakdown,
  budgetAllocation,
  targetingOverview,
} from '../services/targetingService';
import './Targeting.css';

const TABS = [
  { id: 'behavioral', label: 'السلوكي', icon: '◎' },
  { id: 'geo',        label: 'الجغرافي', icon: '⌖' },
  { id: 'ai',         label: 'تنبؤ AI', icon: 'AI' },
  { id: 'interests',  label: 'الاهتمامات الدقيقة', icon: '⊕' },
  { id: 'time',       label: 'الزمني', icon: '◷' },
  { id: 'device',     label: 'الأجهزة', icon: '▢' },
  { id: 'budget',     label: 'الميزانية التنبؤية', icon: '$' },
];

const PLATFORM_OPTIONS = ['all', 'Facebook', 'Instagram', 'Google Ads', 'TikTok'];
const PLATFORM_LABEL = { all: 'كل المنصات' };

function fmt(n) {
  return Number(n).toLocaleString('ar-EG');
}

function heatColor(v) {
  // تدرّج من شفاف إلى لون primary حسب الشدّة
  const alpha = (v / 100) * 0.85 + 0.05;
  return `rgba(0, 196, 167, ${alpha.toFixed(2)})`;
}

export default function Targeting() {
  const { campaigns } = useCampaigns();
  const [tab, setTab] = useState('behavioral');

  const overview = useMemo(() => targetingOverview(campaigns), [campaigns]);

  return (
    <>
      <div className="page-header">
        <h2>الاستهداف الذكي</h2>
        <p>تحليل الجمهور وتحسين الحملات بالاعتماد على بيانات المنصات المربوطة</p>
      </div>

      {/* ملخص علوي */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">المنصات المربوطة</div>
          <div className="stat-value">{overview.connectedCount}</div>
          <div className={`stat-change ${overview.connectedCount > 0 ? 'up' : ''}`}>
            {overview.connectedCount > 0 ? overview.connected.join(' · ') : 'لا توجد منصات مربوطة'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">جمهور عالي النية</div>
          <div className="stat-value">{fmt(overview.highIntentAudience)}</div>
          <div className="stat-change up">جاهز للتحويل</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">إجمالي الجمهور المُحلَّل</div>
          <div className="stat-value">{fmt(overview.totalAudience)}</div>
          <div className="stat-change">عبر كل المستويات</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">أنشط منطقة</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{overview.topRegion?.name}</div>
          <div className="stat-change up">ذروة {overview.topRegion?.peak}</div>
        </div>
      </div>

      {overview.connectedCount === 0 && (
        <div className="targeting-notice">
          لعرض بيانات أدق، اربط منصاتك الإعلانية من صفحة <strong>ربط المنصات</strong>. النتائج الحالية تقديرية مبنية على حملاتك.
        </div>
      )}

      {/* التبويبات */}
      <div className="targeting-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`targeting-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="targeting-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="targeting-panel">
        {tab === 'behavioral' && <BehavioralTab campaigns={campaigns} />}
        {tab === 'geo' && <GeoTab campaigns={campaigns} />}
        {tab === 'ai' && <AITab campaigns={campaigns} />}
        {tab === 'interests' && <InterestsTab campaigns={campaigns} />}
        {tab === 'time' && <TimeTab campaigns={campaigns} />}
        {tab === 'device' && <DeviceTab campaigns={campaigns} />}
        {tab === 'budget' && <BudgetTab campaigns={campaigns} />}
      </div>
    </>
  );
}

/* ── 1) السلوكي ───────────────────────────────────────────────── */
function BehavioralTab({ campaigns }) {
  const segments = useMemo(() => behavioralSegments(campaigns), [campaigns]);
  return (
    <>
      <SectionTitle
        title="الاستهداف بالسلوك"
        desc="تقسيم الجمهور حسب نية الشراء الفعلية المستنتجة من تفاعله مع إعلاناتك السابقة."
      />
      <div className="seg-grid">
        {segments.map((s) => (
          <div key={s.key} className="card seg-card">
            <div className="seg-head">
              <span className={`badge badge-${s.color === 'success' ? 'active' : s.color === 'warning' ? 'paused' : 'draft'}`}>
                {s.label}
              </span>
              <span className="seg-pct">{s.pct}%</span>
            </div>
            <div className="seg-audience">{fmt(s.audience)}</div>
            <div className="seg-audience-label">مستخدم في هذه الشريحة</div>
            <div className="seg-bar">
              <div className={`seg-bar-fill seg-${s.color}`} style={{ width: `${s.pct}%` }} />
            </div>
            <ul className="tips-list" style={{ marginTop: 14 }}>
              {s.signals.map((sig) => <li key={sig}>{sig}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 2) الجغرافي ──────────────────────────────────────────────── */
function GeoTab({ campaigns }) {
  const regions = useMemo(() => geoActivity(campaigns), [campaigns]);
  return (
    <>
      <SectionTitle
        title="الاستهداف الجغرافي المتقدم"
        desc="المناطق الأكثر نشاطاً لحملاتك مع أوقات الذروة المقترحة لكل منطقة."
      />
      <div className="card">
        <div className="geo-list">
          {regions.map((r) => (
            <div key={r.code} className="geo-row">
              <div className="geo-name">
                <span className="geo-rank">{regions.indexOf(r) + 1}</span>
                {r.name}
              </div>
              <div className="geo-track">
                <div className="geo-fill" style={{ width: `${r.activity}%` }} />
                <span className="geo-activity">{r.activity}%</span>
              </div>
              <div className="geo-meta">
                <span title="الوصول المتوقع">◴ {fmt(r.reach)}</span>
                <span title="وقت الذروة" className="geo-peak">⏱ {r.peak}</span>
                <span title="معدل النقر">CTR {r.ctr}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── 3) تنبؤ AI ───────────────────────────────────────────────── */
function AITab({ campaigns }) {
  const [platform, setPlatform] = useState('all');
  const [objective, setObjective] = useState('conversions');
  const result = useMemo(
    () => predictAudience(campaigns, { platform, objective }),
    [campaigns, platform, objective]
  );

  return (
    <>
      <SectionTitle
        title="التنبؤ بالجمهور بالذكاء الاصطناعي"
        desc="خوارزمية تتعلّم من حملاتك السابقة لتقترح الفئة الأكثر احتمالاً للتفاعل مع إعلان جديد."
      />
      <div className="grid-2">
        <div className="card">
          <div className="card-title">إعدادات التنبؤ</div>
          <label className="field">
            <span>المنصة</span>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{PLATFORM_LABEL[p] || p}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>هدف الحملة</span>
            <select value={objective} onChange={(e) => setObjective(e.target.value)}>
              <option value="conversions">تحويلات / مبيعات</option>
              <option value="traffic">زيارات الموقع</option>
              <option value="awareness">وعي بالعلامة</option>
              <option value="leads">جمع عملاء محتملين</option>
            </select>
          </label>
          <p className="ai-note">{result.note}</p>
        </div>

        <div className="card ai-result">
          <div className="card-title">الجمهور المتوقّع</div>
          <div className="ai-confidence">
            <span>دقة التنبؤ</span>
            <strong>{result.confidence}%</strong>
          </div>
          <div className="ai-meta-grid">
            <div><span>الفئة العمرية</span><strong>{result.age}</strong></div>
            <div><span>الجنس</span><strong>{result.gender}</strong></div>
            <div><span>CTR متوقّع</span><strong>{result.predictedCtr}%</strong></div>
            <div><span>الوصول التقديري</span><strong>{fmt(result.estReach)}</strong></div>
          </div>
          <div className="ai-interests">
            <span>أبرز الاهتمامات:</span>
            <div className="chip-row">
              {result.interests.map((i) => <span key={i} className="chip">{i}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 4) الاهتمامات الدقيقة ────────────────────────────────────── */
function InterestsTab({ campaigns }) {
  const groups = useMemo(() => microInterests(campaigns), [campaigns]);
  return (
    <>
      <SectionTitle
        title="الاستهداف بالاهتمامات الدقيقة"
        desc="تقسيم الجمهور إلى مجموعات صغيرة جداً حسب اهتماماتهم الدقيقة ومؤشر التقارب (Affinity)."
      />
      <div className="interest-grid">
        {groups.map((g) => (
          <div key={g.group} className="card">
            <div className="card-title">{g.group}</div>
            {g.items.map((item) => (
              <div key={item.name} className="interest-row">
                <span className="interest-name">{item.name}</span>
                <span className="interest-size">{fmt(item.size)}</span>
                <span className="chip chip-affinity">×{item.affinity}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 5) الزمني ────────────────────────────────────────────────── */
function TimeTab({ campaigns }) {
  const [platform, setPlatform] = useState('all');
  const data = useMemo(() => timeHeatmap(campaigns, platform), [campaigns, platform]);

  return (
    <>
      <SectionTitle
        title="الاستهداف الزمني"
        desc="أفضل أوقات النشر تلقائياً حسب نشاط جمهورك على كل منصة."
      />
      <div className="card">
        <div className="time-toolbar">
          <label className="field field-inline">
            <span>المنصة</span>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{PLATFORM_LABEL[p] || p}</option>
              ))}
            </select>
          </label>
          <div className="time-legend">
            <span>أقل نشاطاً</span>
            <span className="legend-bar" />
            <span>أكثر نشاطاً</span>
          </div>
        </div>

        <div className="heatmap" role="table">
          <div className="heatmap-row heatmap-head">
            <span className="heatmap-corner" />
            {data.slots.map((s) => <span key={s} className="heatmap-col-label">{s}</span>)}
          </div>
          {data.days.map((day, di) => (
            <div key={day} className="heatmap-row">
              <span className="heatmap-day">{day}</span>
              {data.grid[di].map((v, si) => (
                <span
                  key={si}
                  className="heatmap-cell"
                  style={{ background: heatColor(v) }}
                  title={`${day} · ${data.slots[si]} → ${v}%`}
                >
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="time-best">
          <span className="time-best-label">أفضل 3 أوقات للنشر:</span>
          {data.top.map((t, i) => (
            <span key={i} className="chip chip-best">{t.day} · {t.slot} ({t.v}%)</span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── 6) الأجهزة ───────────────────────────────────────────────── */
function DeviceTab({ campaigns }) {
  const [platform, setPlatform] = useState('all');
  const devices = useMemo(() => deviceBreakdown(campaigns, platform), [campaigns, platform]);

  return (
    <>
      <SectionTitle
        title="الاستهداف عبر الأجهزة"
        desc="توزيع جمهورك حسب نوع الجهاز مع توصيات لتحسين تجربة المشاهدة لكل جهاز."
      />
      <label className="field field-inline" style={{ marginBottom: 16 }}>
        <span>المنصة</span>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>{PLATFORM_LABEL[p] || p}</option>
          ))}
        </select>
      </label>
      <div className="device-grid">
        {devices.map((d) => (
          <div key={d.key} className="card device-card">
            <div className="device-head">
              <span className="device-name">{d.device}</span>
              <span className="device-pct">{d.pct}%</span>
            </div>
            <div className="seg-bar">
              <div className="seg-bar-fill seg-success" style={{ width: `${d.pct}%` }} />
            </div>
            <div className="device-ctr">CTR: <strong>{d.ctr}%</strong></div>
            <p className="device-tip">{d.tip}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 7) الميزانية التنبؤية ────────────────────────────────────── */
function BudgetTab({ campaigns }) {
  const defaultBudget = useMemo(
    () => campaigns.reduce((s, c) => s + c.budget, 0),
    [campaigns]
  );
  const [budget, setBudget] = useState(defaultBudget);
  const data = useMemo(() => budgetAllocation(campaigns, Number(budget) || 0), [campaigns, budget]);
  const maxRec = Math.max(...data.rows.map((r) => r.recommended), 1);

  return (
    <>
      <SectionTitle
        title="التوزيع التنبؤي للميزانية"
        desc="توزيع الميزانية تلقائياً على الحملات الأعلى عائداً على الإنفاق (ROAS)."
      />
      <div className="card">
        <label className="field field-inline" style={{ marginBottom: 18 }}>
          <span>الميزانية الإجمالية (جنيه)</span>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>

        {data.rows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>لا توجد حملات لتوزيع الميزانية عليها.</p>
        ) : (
          <div className="alloc-list">
            {data.rows.map((r) => (
              <div key={r.id} className="alloc-row">
                <div className="alloc-info">
                  <span className="alloc-name">{r.name}</span>
                  <span className="alloc-platform">{r.platform}</span>
                </div>
                <div className="alloc-track">
                  <div className="alloc-fill" style={{ width: `${(r.recommended / maxRec) * 100}%` }} />
                </div>
                <div className="alloc-numbers">
                  <span className="alloc-amount">{fmt(r.recommended)}</span>
                  <span className="chip chip-roas">ROAS ×{r.roas}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* مكوّن عنوان قسم مشترك */
function SectionTitle({ title, desc }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
