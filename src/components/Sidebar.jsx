import './Sidebar.css';

const NAV = [
  { id: 'dashboard',    label: 'لوحة التحكم', icon: '▦' },
  { id: 'campaigns',    label: 'الحملات',      icon: '◉' },
  { id: 'quotation',    label: 'العروض السعرية', icon: '💬' },
  { id: 'ai',           label: 'مساعد AI',     icon: 'AI' },
  { id: 'analytics',   label: 'التحليلات',    icon: '⌁' },
  { id: 'targeting',   label: 'الاستهداف الذكي', icon: '⌖' },
  { id: 'integrations',label: 'ربط المنصات',  icon: '⇆' },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-item"
          onClick={() => onNavigate('landing')}
          title="الصفحة الرئيسية"
        >
          <span className="nav-icon">⌂</span>
          <span className="nav-label">الرئيسية</span>
        </button>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}
