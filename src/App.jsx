/**
 * Updated App.jsx
 * التطبيق الرئيسي مع مكون الإعلامات
 */

import React, { useState } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Targeting from './pages/Targeting';
import Integrations from './pages/Integrations';
import Quotation from './pages/Quotation';
import Landing from './pages/Landing';
import { useCampaignsStore } from './store/useCampaignsStore';
import './App.css';

const PAGES = {
  dashboard: Dashboard,
  campaigns: Campaigns,
  ai: AIAssistant,
  analytics: Analytics,
  targeting: Targeting,
  integrations: Integrations,
  quotation: Quotation,
};

export default function App() {
  const [page, setPage] = useState('landing');
  // تحميل البيانات المحفوظة من localStorage عند بدء التطبيق
  useCampaignsStore.persist.rehydrate();
  const Page = PAGES[page];

  if (page === 'landing') {
    return (
      <div className="app">
        <TitleBar />
        <div className="app-body">
          <main className="main-content" style={{ padding: 0 }}>
            <Landing onStart={() => setPage('dashboard')} />
          </main>
        </div>
        <Notification />
      </div>
    );
  }

  return (
    <div className="app">
      <TitleBar />
      <div className="app-body">
        <Sidebar active={page} onNavigate={setPage} />
        <main className="main-content">
          <Page />
        </main>
      </div>
      <Notification />
    </div>
  );
}
