import React from 'react';
import { Tab } from '../types.ts';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isDarkMode, toggleDarkMode }) => {
  const menuItems = [
    { id: Tab.Domains, label: '自定义域名', icon: '🌐' },
    { id: Tab.Generator, label: '随机子域名', icon: '✨' },
    { id: Tab.Settings, label: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 h-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <img 
          src="https://image.hyeri.us.kg/icon.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-xl object-cover shadow-sm" 
        />
        <div className="flex flex-col">
          <h1 className="font-bold text-lg dark:text-white">子怡云</h1>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Pages 管理系统</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === item.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">v2.6 Stable</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;