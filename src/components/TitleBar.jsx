import './TitleBar.css';

export default function TitleBar() {
  const api = window.electronAPI;

  return (
    <header className="titlebar">
      <div className="titlebar-brand">
        <span className="titlebar-logo">▶</span>
        <span className="titlebar-name">Zoom Adv AI</span>
      </div>
      <div className="titlebar-controls">
        <button type="button" className="ctrl-btn" onClick={() => api?.minimize()} aria-label="تصغير">─</button>
        <button type="button" className="ctrl-btn" onClick={() => api?.maximize()} aria-label="تكبير">□</button>
        <button type="button" className="ctrl-btn close" onClick={() => api?.close()} aria-label="إغلاق">×</button>
      </div>
    </header>
  );
}
