import { useCampaigns } from '../context/CampaignsContext';
import './Analytics.css';

const PLATFORM_LIST = ['Facebook', 'Google Ads', 'Instagram', 'TikTok'];

export default function Analytics() {
  const { campaigns } = useCampaigns();
  const filtered = campaigns.filter((c) => c.status !== 'draft');
  const maxSpent = Math.max(...filtered.map((c) => c.spent), 1);

  const totalSpent = filtered.reduce((s, c) => s + c.spent, 0);
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <>
      <div className="page-header">
        <h2>التحليلات</h2>
        <p>أداء الحملات عبر المنصات المختلفة</p>
      </div>

      {/* ملخص أرقام */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">إجمالي المصروف</div>
          <div className="stat-value">{totalSpent.toLocaleString('ar-EG')}</div>
          <div className="stat-change">جنيه</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">المتبقي من الميزانية</div>
          <div className="stat-value">{remaining.toLocaleString('ar-EG')}</div>
          <div className="stat-change">{totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">الحملات المُحلَّلة</div>
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-change">مسودات مستبعدة</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">أعلى CTR</div>
          <div className="stat-value">
            {filtered.length > 0 ? `${Math.max(...filtered.map((c) => c.ctr))}%` : '-'}
          </div>
          <div className="stat-change up">Instagram</div>
        </div>
      </div>

      {/* رسم بياني — المصروف */}
      <div className="card analytics-chart">
        <div className="card-title">المصروف حسب الحملة</div>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>لا توجد بيانات لعرضها.</p>
        ) : (
          <div className="bar-chart">
            {filtered.map((c) => (
              <div key={c.id} className="bar-row">
                <span className="bar-label" title={c.name}>{c.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.spent / maxSpent) * 100}%` }} />
                </div>
                <span className="bar-value">{c.spent.toLocaleString('ar-EG')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-title">CTR حسب المنصة</div>
          {PLATFORM_LIST.map((platform) => {
            const pc = filtered.filter((c) => c.platform === platform);
            const avg = pc.length
              ? (pc.reduce((s, c) => s + c.ctr, 0) / pc.length).toFixed(1)
              : null;
            return (
              <div key={platform} className="platform-row">
                <span>{platform}</span>
                <span className="platform-ctr">{avg !== null ? `${avg}%` : '—'}</span>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">ملخص الأداء</div>
          <ul className="tips-list">
            <li>Instagram يحقق أعلى CTR بنسبة 4.1%</li>
            <li>Google Ads أفضل للتحويلات المباشرة</li>
            <li>TikTok مناسب لجمهور شاب بتكلفة منخفضة</li>
            <li>Facebook يمنح تغطية واسعة للسوق المصري</li>
          </ul>
        </div>
      </div>
    </>
  );
}
