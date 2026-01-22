
import React, { useState } from 'react';
import { UserConfig } from '../types.ts';

interface SettingsProps {
  config: UserConfig;
  setConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
}

const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [localConfig, setLocalConfig] = useState<UserConfig>({ ...config });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig)
      });
      const data = await resp.json();
      if (data.success) {
        setConfig(localConfig);
        alert("✅ 配置保存成功，系统已同步");
      }
    } catch (e) {
      alert("❌ 保存出错: " + e);
    } finally {
      setSaving(false);
    }
  };

  const updatePath = (index: number, field: 'label' | 'value', val: string) => {
    const newPaths = [...localConfig.paths];
    newPaths[index][field] = val;
    setLocalConfig({ ...localConfig, paths: newPaths });
  };

  const addPath = () => {
    const nextIndex = localConfig.paths.length + 1;
    setLocalConfig({ 
      ...localConfig, 
      paths: [...localConfig.paths, { label: 'U' + nextIndex, value: '' }] 
    });
  };

  const removePath = (index: number) => {
    setLocalConfig({ 
      ...localConfig, 
      paths: localConfig.paths.filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black dark:text-white tracking-tight">系统环境设置</h2>
          <p className="text-slate-500 text-sm">配置 API 凭据与生成逻辑（设置后请点保存）</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
        >
          {saving ? '正在同步...' : '保存当前配置'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Credentials */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <span className="text-base">🔑</span> Cloudflare 核心凭据
          </h3>
          <div className="space-y-6 p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">1. 账户 ID (Account ID)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all font-mono"
                value={localConfig.accountId}
                onChange={(e) => setLocalConfig({...localConfig, accountId: e.target.value})}
                placeholder="Cloudflare 仪表盘获取的 Account ID"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">2. Pages 令牌 (Pages API Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-emerald-500 transition-all font-mono"
                value={localConfig.pagesToken}
                onChange={(e) => setLocalConfig({...localConfig, pagesToken: e.target.value})}
                placeholder="包含 Cloudflare Pages: Edit 权限的令牌"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">3. DNS 令牌 (Zone API Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-orange-500 transition-all font-mono"
                value={localConfig.zoneToken}
                onChange={(e) => setLocalConfig({...localConfig, zoneToken: e.target.value})}
                placeholder="包含 DNS: Edit 权限的令牌"
              />
            </div>
          </div>
        </section>

        {/* Generator Setup */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <span className="text-base">✨</span> 界面与生成参数
          </h3>
          <div className="space-y-6 p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">分发主域名 (Parent Domain)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-purple-500 transition-all font-mono"
                value={localConfig.parentDomain}
                onChange={(e) => setLocalConfig({...localConfig, parentDomain: e.target.value})}
                placeholder="例如: hyeri.top"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">面板背景 URL (Background)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-purple-500 transition-all font-mono"
                value={localConfig.backgroundUrl}
                onChange={(e) => setLocalConfig({...localConfig, backgroundUrl: e.target.value})}
                placeholder="支持图片/视频直链，留空使用渐变背景"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Path List Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="text-base">🔗</span> URL 路径模板管理 (U1, U2...)
          </h3>
          <button 
            onClick={addPath}
            className="text-[11px] font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/20"
          >
            + 新增 U 槽位
          </button>
        </div>
        <div className="bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-8 py-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">槽位标签</th>
                <th className="px-8 py-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">路径后缀 (Path Value)</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {localConfig.paths.map((path, idx) => (
                <tr key={idx} className="hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <td className="px-8 py-5">
                    <input 
                      className="bg-transparent outline-none font-black text-blue-600 dark:text-blue-400 w-full"
                      value={path.label}
                      onChange={(e) => updatePath(idx, 'label', e.target.value)}
                    />
                  </td>
                  <td className="px-8 py-5">
                    <input 
                      className="bg-transparent w-full outline-none font-mono text-slate-600 dark:text-slate-300"
                      value={path.value}
                      onChange={(e) => updatePath(idx, 'value', e.target.value)}
                      placeholder="例如: vless-config"
                    />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => removePath(idx)}
                      className="text-red-400 hover:text-red-600 font-bold text-xs px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      移除
                    </button>
                  </td>
                </tr>
              ))}
              {localConfig.paths.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic font-medium">尚未定义任何 U 路径槽位</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Settings;
