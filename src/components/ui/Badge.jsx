/**
 * Badge.jsx — مكون مشترك لعرض حالة الحملة
 */

const STATUS_MAP = {
  active: { label: 'نشطة', className: 'badge-active' },
  paused: { label: 'متوقفة', className: 'badge-paused' },
  draft:  { label: 'مسودة', className: 'badge-draft' },
};

export default function Badge({ status }) {
  const { label, className } = STATUS_MAP[status] ?? { label: status, className: 'badge-draft' };
  return <span className={`badge ${className}`}>{label}</span>;
}
