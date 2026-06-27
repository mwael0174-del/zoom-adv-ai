import React, { useState } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Landing from './pages/Landing';
import { CampaignsProvider } from './context/CampaignsContext';
import './App.css';

const PAGES = {
  dashboard:    Dashboard,
  campaigns:    Campaigns,
  ai:           AIAssistant,
  analytics:    Analytics,
  integrations: Integrations,
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
    </CampaignsProvider>
  );
}
