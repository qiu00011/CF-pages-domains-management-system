import React from 'react';
import { Tab } from '../types.ts';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  logo: string;
  name: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isDarkMode, toggleDarkMode, logo, name }) => {
  const menuItems = [
    { id: Tab.Domains, label: '域名控制', icon: '🌐' },
    { id: Tab.Generator, label: '随机生成', icon: '✨' },
    { id: Tab.Settings, label: '配置中心', icon: '⚙️' },
  ];

  return (
    <>
      {/* 移动端顶栏 */}
      <div className="md:hidden flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <img src={logo} className="w-9 h-9 rounded-2xl shadow-lg object-cover" />
          <h1 className="font-black text-base dark:text-white tracking-tight">{name}</h1>
        </div>
        <button onClick={toggleDarkMode} className="p-3 rounded-2xl glass text-lg shadow-sm">
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* 桌面端侧边栏 */}
      <div className="w-64 max-md:hidden glass rounded-[36px] p-6 flex flex-col shadow-2xl mr-4 border-white/20">
        <div className="flex items-center gap-4 mb-12 pl-2">
          <img src={logo} className="w-12 h-12 rounded-2xl shadow-xl object-cover" />
          <h1 className="font-black text-xl dark:text-white tracking-tighter leading-tight">{name}</h1>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xl scale-[1.03]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-black text-sm uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={toggleDarkMode}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl hover:scale-110 active:scale-95 transition-transform"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Stable v2.6</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;