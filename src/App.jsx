import React, { useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Targeting from './pages/Targeting';
import Integrations from './pages/Integrations';
import Quotation from './pages/Quotation';
import Landing from './pages/Landing';
import { CampaignsProvider } from './context/CampaignsContext';
import './App.css';

const PAGES = {
  dashboard:    Dashboard,
  campaigns:    Campaigns,
  ai:           AIAssistant,
  analytics:    Analytics,
  targeting:    Targeting,
  integrations: Integrations,
  quotation:    Quotation,
};

export default function App() {
  const [page, setPage] = useState('landing');
  const Page = PAGES[page];

  if (page === 'landing') {
    return (
      <CampaignsProvider>
        <div className="app">
          <TitleBar />
          <div className="app-body">
            <main className="main-content" style={{ padding: 0 }}>
              <Landing onStart={() => setPage('dashboard')} />
            </main>
          </div>
        </div>
        <VercelAnalytics />
      </CampaignsProvider>
    );
  }

  return (
    <CampaignsProvider>
      <div className="app">
        <TitleBar />
        <div className="app-body">
          <Sidebar active={page} onNavigate={setPage} />
          <main className="main-content">
            <Page />
          </main>
        </div>
      </div>
      <VercelAnalytics />
    </CampaignsProvider>
  );
}
