
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
    parentDomain: 'example.com',
    paths: [{ label: 'U1', value: 'uuid' }]
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
      document.body.appendChild(bgEl);
      setTimeout(() => bgEl.style.opacity = '1', 50);
    }
  }, [config.backgroundUrl]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchConfig(); }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden animate-fade-in relative z-10">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 glass m-4 rounded-3xl shadow-2xl">
        {activeTab === Tab.Domains && <DomainManager config={config} />}
        {activeTab === Tab.Generator && <SubdomainGenerator config={config} />}
        {activeTab === Tab.Settings && <Settings config={config} setConfig={setConfig} />}
      </main>

      {/* Decorative Blur Background (fallback when no custom bg) */}
      {!config.backgroundUrl && (
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-100 via-white to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
      )}
    </div>
  );
};

export default App;
