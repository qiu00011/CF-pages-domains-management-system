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
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      <div className="p-8 mb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
            ZY
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight">子怡云</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 bg-slate-950/50 border-t border-slate-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <span className="text-xs font-bold uppercase tracking-wider">系统主题</span>
          <span className="text-lg">{isDarkMode ? '🌙' : '☀️'}</span>
        </button>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Version 2.6 Stable</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;