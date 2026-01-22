
import React from 'react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isDarkMode, toggleDarkMode }) => {
  const menuItems = [
    { id: Tab.Domains, label: '域名管理', icon: '🌐' },
    { id: Tab.Generator, label: '随机生成', icon: '✨' },
    { id: Tab.Settings, label: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="w-64 glass m-4 mr-0 rounded-3xl p-6 flex flex-col shadow-xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
          CF
        </div>
        <h1 className="font-semibold text-lg dark:text-white">Pages Hub</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'hover:bg-white/50 dark:hover:bg-black/20 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <span className="text-xs text-slate-400">v2.0 Stable</span>
      </div>
    </div>
  );
};

export default Sidebar;
