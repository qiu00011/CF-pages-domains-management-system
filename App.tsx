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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [config, setConfig] = useState<UserConfig>({
    accountId: '',
    pagesToken: '',
    zoneToken: '',
    backgroundUrl: '',
    parentDomain: 'hyeri.top',
    paths: [{ label: 'U1', value: '' }]
  });

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

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchConfig(); }} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {activeTab === Tab.Domains && '🌐'}
              {activeTab === Tab.Generator && '✨'}
              {activeTab === Tab.Settings && '⚙️'}
            </span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {activeTab === Tab.Domains && '自定义域名管理'}
              {activeTab === Tab.Generator && '随机域名分发'}
              {activeTab === Tab.Settings && '系统配置中心'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              CF API 已连接
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === Tab.Domains && <DomainManager config={config} />}
            {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
            {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
          </div>
        </div>
      </main>

      {config.backgroundUrl && (
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]">
          {config.backgroundUrl.endsWith('.mp4') ? (
            <video autoPlay loop muted className="w-full h-full object-cover">
              <source src={config.backgroundUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${config.backgroundUrl})` }} />
          )}
        </div>
      )}
    </div>
  );
};

export default App;