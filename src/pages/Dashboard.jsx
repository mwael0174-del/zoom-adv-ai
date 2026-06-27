import { useCampaigns } from '../context/CampaignsContext';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const { campaigns } = useCampaigns();

  const active = campaigns.filter((c) => c.status === 'active');
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const avgCtr = campaigns.length
    ? (campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length).toFixed(1)
    : 0;
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <h2>لوحة التحكم</h2>
        <p>نظرة عامة على أداء حملاتك الإعلانية</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="الحملات النشطة"
          value={active.length}
          change={`من أصل ${campaigns.length} حملة`}
          changeType="up"
        />
        <StatCard
          label="إجمالي الميزانية"
          value={totalBudget.toLocaleString('ar-EG')}
          change="جنيه مصري"
        />
        <StatCard
          label="المصروف"
          value={totalSpent.toLocaleString('ar-EG')}
          change={`${spentPct}% من الميزانية`}
          changeType={spentPct > 80 ? 'down' : ''}
        />
        <StatCard
          label="متوسط CTR"
          value={`${avgCtr}%`}
          change="↑ 0.4% عن الأسبوع الماضي"
          changeType="up"
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">آخر الحملات</div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>الحملة</th>
                <th>المنصة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 4).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.platform}</td>
                  <td><Badge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">نصائح AI سريعة</div>
          <ul className="tips-list">
            <li>زِد ميزانية حملة Instagram بنسبة 15% لأنها تحقق أعلى CTR حاليًا</li>
            <li>أوقف الحملات ذات CTR أقل من 2% بعد 72 ساعة</li>
            <li>جرّب A/B testing على نصوص الإعلانات هذا الأسبوع</li>
            <li>أفضل وقت للنشر: 8-10 مساءً أيام الخميس والجمعة</li>
          </ul>
        </div>
      </div>
    </>
  );
}
