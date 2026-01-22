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

  // Load config from backend
  const fetchConfig = useCallback(async () => {
    try {
      const resp = await fetch('/api/config');
      const data = await resp.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to load config", err);
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

  // Handle Background
  useEffect(() => {
    const existingBg = document.getElementById('custom-bg-layer');
    if (existingBg) existingBg.remove();

    if (config.backgroundUrl) {
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(config.backgroundUrl);
      const bgEl = isVideo ? document.createElement('video') : document.createElement('img');
      
      bgEl.id = 'custom-bg-layer';
      (bgEl as any).src = config.backgroundUrl;
      if (isVideo) {
        (bgEl as HTMLVideoElement).autoplay = true;
        (bgEl as HTMLVideoElement).loop = true;
        (bgEl as HTMLVideoElement).muted = true;
        (bgEl as HTMLVideoElement).playsInline = true;
      }
      bgEl.style.opacity = '0';
      bgEl.style.position = 'fixed';
      bgEl.style.top = '0';
      bgEl.style.left = '0';
      bgEl.style.width = '100%';
      bgEl.style.height = '100%';
      bgEl.style.objectFit = 'cover';
      bgEl.style.zIndex = '-10';
      bgEl.style.transition = 'opacity 1s ease';
      document.body.appendChild(bgEl);
      setTimeout(() => bgEl.style.opacity = '1', 50);
    }
  }, [config.backgroundUrl]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchConfig(); }} />;
  }

  const mobileTabs = [
    { id: Tab.Domains, label: '域名', icon: '🌐' },
    { id: Tab.Generator, label: '生成', icon: '✨' },
    { id: Tab.Settings, label: '配置', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden animate-fade-in relative z-10 max-md:flex-col">
      
      {/* Mobile Top Header (分栏标题) */}
      <header className="md:hidden flex items-center justify-between p-4 px-6 glass rounded-b-[24px] border-none shadow-lg">
        <div className="flex items-center gap-3">
          <img src="https://image.hyeri.us.kg/icon.png" className="w-8 h-8 rounded-xl object-cover" alt="Logo" />
          <h1 className="font-black text-slate-800 dark:text-white tracking-tight">子怡云</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg">
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Sidebar for Desktop (侧边分栏) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 max-md:p-4 max-md:pb-24 glass m-4 max-md:m-3 rounded-[32px] shadow-2xl custom-scroll border-white/30 dark:border-white/10">
        {activeTab === Tab.Domains && <DomainManager config={config} />}
        {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
        {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
      </main>

      {/* Mobile Bottom Navigation (底部固定的分栏入口) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 glass rounded-[28px] p-2 flex justify-around shadow-2xl border-white/40 dark:border-white/10 z-50">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 w-full py-3 transition-all ${
              activeTab === tab.id 
              ? 'text-blue-600 dark:text-blue-400 scale-105 font-black' 
              : 'text-slate-400 opacity-60'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[9px] uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Decorative Blur Background (fallback when no custom bg) */}
      {!config.backgroundUrl && (
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-100 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      )}
    </div>
  );
};

export default App;