import React, { useState, useEffect, useCallback } from 'react';
import { UserConfig, Tab } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import DomainManager from './components/DomainManager.tsx';
import SubdomainGenerator from './components/SubdomainGenerator.tsx';
import Settings from './components/Settings.tsx';
import Login from './components/Login.tsx';

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
      if (!resp.ok) throw new Error('Network response was not ok');
      const data = await resp.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.warn("无法加载配置，可能尚未初始化", err);
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
    <div className="flex h-screen w-screen overflow-hidden animate-fade-in relative z-10 max-md:flex-col">
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
      
      {config.backgroundUrl && (
        config.backgroundUrl.endsWith('.mp4') ? (
          <video autoPlay loop muted className="fixed inset-0 -z-20 w-full h-full object-cover opacity-40 dark:opacity-20">
            <source src={config.backgroundUrl} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="fixed inset-0 -z-20 bg-cover bg-center opacity-40 dark:opacity-20"
            style={{ backgroundImage: `url(${config.backgroundUrl})` }}
          />
        )
      )}
    </div>
  );
};

export default App;