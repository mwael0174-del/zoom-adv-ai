/**
 * ProgressBar.jsx — شريط تقدم مشترك
 */

export default function ProgressBar({ value, max, className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
