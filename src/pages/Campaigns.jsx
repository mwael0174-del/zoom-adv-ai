/**
 * Updated Campaigns Page
 * صفحة الحملات المحدثة مع استخدام Zustand و Validation
 */

import { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useUIStore } from '../store/useUIStore';
import { campaignFormSchema } from '../schemas/campaign.schema';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import './Campaigns.css';

const EMPTY_FORM = { name: '', platform: 'Facebook' as const, budget: '' };

export default function Campaigns() {
  const {
    campaigns,
    loading,
    showForm,
    handleAddCampaign,
    handleDeleteCampaign,
    handleUpdateStatus,
    toggleForm,
  } = useCampaigns();

  const { showDeleteConfirm, setDeleteConfirm } = useUIStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // التحقق من البيانات
    const validation = campaignFormSchema.safeParse({
      name: form.name,
      platform: form.platform,
      budget: Number(form.budget),
    });

    if (!validation.success) {
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        setFormErrors((prev) => ({
          ...prev,
          [path]: err.message,
        }));
      });
      return;
    }

    const success = await handleAddCampaign(validation.data);
    if (success) {
      setForm(EMPTY_FORM);
      setFormErrors({});
    }
  };

  const handleToggle = (id: number, current: string) => {
    handleUpdateStatus(
      id,
      current === 'active' ? 'paused' : 'active'
    );
  };

  const handleDelete = (id: number) => {
    if (showDeleteConfirm === id) {
      handleDeleteCampaign(id);
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
          onClick={toggleForm}
          disabled={loading}
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
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && (
                <span className="error-message">{formErrors.name}</span>
              )}
            </label>
            <label>
              المنصة
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm({
                    ...form,
                    platform: e.target.value as any,
                  })
                }
              >
                <option value="Facebook">Facebook</option>
                <option value="Google">Google</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
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
                className={formErrors.budget ? 'error' : ''}
              />
              {formErrors.budget && (
                <span className="error-message">{formErrors.budget}</span>
              )}
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحملة'}
          </button>
        </form>
      )}

      <div className="campaigns-list">
        {campaigns.length === 0 && (
          <div
            className="card"
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: 40,
            }}
          >
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
                <span className="cs-val">
                  {c.budget.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div>
                <span className="cs-label">المصروف</span>
                <span className="cs-val">
                  {c.spent.toLocaleString('ar-EG')} ج.م
                </span>
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
                  disabled={loading}
                >
                  {c.status === 'active' ? '⏸ إيقاف مؤقت' : '▶ تشغيل'}
                </button>
              )}
              <button
                type="button"
                className={`btn campaign-delete ${
                  showDeleteConfirm === c.id ? 'btn-danger' : 'btn-ghost'
                }`}
                onClick={() => handleDelete(c.id)}
                title="حذف الحملة"
                disabled={loading}
              >
                {showDeleteConfirm === c.id ? 'تأكيد الحذف؟' : '🗑 حذف'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
