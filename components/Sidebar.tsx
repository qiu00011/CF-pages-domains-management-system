
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
    { id: Tab.Domains, label: '域名控制', icon: '🌐' },
    { id: Tab.Generator, label: '随机分发', icon: '✨' },
    { id: Tab.Settings, label: '配置中心', icon: '⚙️' },
  ];

  return (
    <div className="w-64 glass m-4 mr-0 rounded-[32px] p-8 flex flex-col shadow-2xl border-white/30 dark:border-white/10 max-md:hidden">
      <div className="flex items-center gap-4 mb-14 pl-2">
        <img 
          src="https://image.hyeri.us.kg/icon.png" 
          alt="Logo" 
          className="w-12 h-12 rounded-2xl shadow-xl rotate-3 object-cover border-2 border-white/50" 
        />
        <div className="flex flex-col">
          <h1 className="font-black text-xl dark:text-white tracking-tighter leading-none">子怡VPN</h1>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-60">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.03]'
                : 'hover:bg-white/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-black text-sm uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-2">
        <button
          onClick={toggleDarkMode}
          className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-90 transition-all shadow-inner"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">v2.6 Stable</span>
          <span className="text-[8px] text-emerald-500 font-bold">● ONLINE</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
