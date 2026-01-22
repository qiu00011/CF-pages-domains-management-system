import React, { useState, useEffect, useCallback } from 'react';
import { UserConfig, Tab } from './types';
import Sidebar from './components/Sidebar';
import DomainManager from './components/DomainManager';
import SubdomainGenerator from './components/SubdomainGenerator';
import Settings from './components/Settings';
import Login from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Domains);
  const [config, setConfig] = useState<UserConfig>({
    accountId: '',
    pagesToken: '',
    zoneToken: '',
    backgroundUrl: '',
    parentDomain: 'hyeri.top',
    paths: [{ label: 'U1', value: '' }]
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const fetchConfig = useCallback(async () => {
    try {
      const resp = await fetch('/api/config');
      const data = await resp.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Config load error", err);
    }
  }, []);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchConfig();
    }
  }, [fetchConfig]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchConfig(); }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden animate-fade-in relative z-10 max-md:flex-col font-bold">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 max-md:p-4 glass m-4 rounded-[32px] shadow-2xl custom-scroll border-white/30 dark:border-white/10">
        {activeTab === Tab.Domains && <DomainManager config={config} />}
        {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
        {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
      </main>

      {!config.backgroundUrl && (
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900"></div>
      )}
    </div>
  );
};

export default App;