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
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.warn("未检测到预设配置");
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {activeTab === Tab.Domains && '自定义域名管理'}
            {activeTab === Tab.Generator && '随机域名分发'}
            {activeTab === Tab.Settings && '系统配置中心'}
          </h2>
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase">Cloudflare Online</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
          {activeTab === Tab.Domains && <DomainManager config={config} />}
          {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
          {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
        </div>
      </main>

      {config.backgroundUrl && (
        config.backgroundUrl.endsWith('.mp4') ? (
          <video autoPlay loop muted className="fixed inset-0 -z-10 w-full h-full object-cover opacity-5 pointer-events-none">
            <source src={config.backgroundUrl} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="fixed inset-0 -z-10 bg-cover bg-center opacity-5 pointer-events-none"
            style={{ backgroundImage: `url(${config.backgroundUrl})` }}
          />
        )
      )}
    </div>
  );
};

export default App;