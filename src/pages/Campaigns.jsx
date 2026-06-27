import { useState } from 'react';
import { useCampaigns } from '../context/CampaignsContext';
import { PLATFORMS } from '../store/campaignsStore';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import './Campaigns.css';

const EMPTY_FORM = { name: '', platform: PLATFORMS[0], budget: '' };

export default function Campaigns() {
  const { campaigns, addCampaign, updateStatus, deleteCampaign } = useCampaigns();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id الحملة المراد حذفها

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.budget) return;
    addCampaign({ name: form.name, platform: form.platform, budget: Number(form.budget) });
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleToggle = (id, current) => {
    updateStatus(id, current === 'active' ? 'paused' : 'active');
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteCampaign(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  return (
    <>
      <div className="page-header campaigns-header">
        <div>
          <h2>الحملات الإعلانية</h2>
          <p>إدارة وإنشاء حملاتك على جميع المنصات</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); }}
        >
          {showForm ? '× إلغاء' : '+ حملة جديدة'}
        </button>
      </div>

      {showForm && (
        <form className="card campaign-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              اسم الحملة
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: حملة Black Friday"
                required
              />
            </label>
            <label>
              المنصة
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label>
              الميزانية (جنيه)
              <input
                type="number"
                min="100"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="5000"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">إنشاء الحملة</button>
        </form>
      )}

      <div className="campaigns-list">
        {campaigns.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            لا توجد حملات بعد. ابدأ بإنشاء حملتك الأولى!
          </div>
        )}

        {campaigns.map((c) => (
          <div key={c.id} className="card campaign-card">
            <div className="campaign-top">
              <div>
                <h3>{c.name}</h3>
                <span className="campaign-platform">{c.platform}</span>
              </div>
              <Badge status={c.status} />
            </div>

            <div className="campaign-stats">
              <div>
                <span className="cs-label">الميزانية</span>
                <span className="cs-val">{c.budget.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div>
                <span className="cs-label">المصروف</span>
                <span className="cs-val">{c.spent.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div>
                <span className="cs-label">CTR</span>
                <span className="cs-val">{c.ctr}%</span>
              </div>
              <div>
                <span className="cs-label">التقدم</span>
                <ProgressBar value={c.spent} max={c.budget} />
              </div>
            </div>

            <div className="campaign-actions">
              {c.status !== 'draft' && (
                <button
                  type="button"
                  className="btn btn-ghost campaign-toggle"
                  onClick={() => handleToggle(c.id, c.status)}
                >
                  {c.status === 'active' ? '⏸ إيقاف مؤقت' : '▶ تشغيل'}
                </button>
              )}
              <button
                type="button"
                className={`btn campaign-delete ${deleteConfirm === c.id ? 'btn-danger' : 'btn-ghost'}`}
                onClick={() => handleDelete(c.id)}
                title="حذف الحملة"
              >
                {deleteConfirm === c.id ? 'تأكيد الحذف؟' : '🗑 حذف'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
