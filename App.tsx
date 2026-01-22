import React, { useState, useEffect, useCallback } from 'react';
import { UserConfig, Tab } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import DomainManager from './components/DomainManager.tsx';
import SubdomainGenerator from './components/SubdomainGenerator.tsx';
import Settings from './components/Settings.tsx';
import Login from './components/Login.tsx';

const APP_LOGO = "https://image.hyeri.us.kg/icon.png";
const APP_NAME = "子怡vpn面板";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Domains);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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
      console.warn("未检测到云端配置");
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
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // 动态背景处理
    const oldBg = document.getElementById('custom-bg-layer');
    if (oldBg) oldBg.remove();

    if (config.backgroundUrl) {
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(config.backgroundUrl);
      const el = document.createElement(isVideo ? 'video' : 'img');
      el.id = 'custom-bg-layer';
      el.src = config.backgroundUrl;
      el.style.opacity = '0';
      if (isVideo) {
        (el as HTMLVideoElement).autoplay = true;
        (el as HTMLVideoElement).loop = true;
        (el as HTMLVideoElement).muted = true;
        (el as HTMLVideoElement).playsInline = true;
      }
      document.body.appendChild(el);
      setTimeout(() => el.style.opacity = '1', 50);
    }
  }, [isDarkMode, config.backgroundUrl]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchConfig(); }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative z-10 p-4 max-md:p-3 max-md:flex-col">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        logo={APP_LOGO}
        name={APP_NAME}
      />
      
      <main className="flex-1 overflow-y-auto p-10 max-md:p-6 max-md:pb-28 glass rounded-[36px] shadow-2xl relative border-white/20 custom-scroll">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {activeTab === Tab.Domains && <DomainManager config={config} />}
          {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
          {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 glass rounded-[28px] p-2 flex justify-around shadow-2xl border-white/20">
        {[
          { id: Tab.Domains, label: '域名', icon: '🌐' },
          { id: Tab.Generator, label: '生成', icon: '✨' },
          { id: Tab.Settings, label: '配置', icon: '⚙️' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)} 
            className={`flex flex-col items-center justify-center gap-1 w-full py-3 transition-all ${
              activeTab === t.id ? 'text-blue-500 transform -translate-y-1' : 'text-slate-400 opacity-60'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {!config.backgroundUrl && (
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-100 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"></div>
      )}
    </div>
  );
};

export default App;