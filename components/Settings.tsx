
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
        alert("✅ 配置已成功保存并同步到云端");
      }
    } catch (e) {
      alert("❌ 保存失败，请检查网络: " + e);
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
    const nextNum = localConfig.paths.length + 1;
    setLocalConfig({ 
      ...localConfig, 
      paths: [...localConfig.paths, { label: 'U' + nextNum, value: '' }] 
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
          <p className="text-slate-500 text-sm font-medium">手动配置 API 凭据与分发路径模板</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
        >
          {saving ? '正在保存...' : '立即保存配置'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Credentials */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <span className="text-lg">🔑</span> Cloudflare 身份凭据
          </h3>
          <div className="space-y-6 p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">账号 ID (Account ID)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all font-mono"
                value={localConfig.accountId}
                onChange={(e) => setLocalConfig({...localConfig, accountId: e.target.value})}
                placeholder="填写您的 Cloudflare Account ID"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Pages 令牌 (Pages API Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-emerald-500 transition-all font-mono"
                value={localConfig.pagesToken}
                onChange={(e) => setLocalConfig({...localConfig, pagesToken: e.target.value})}
                placeholder="填写包含 Pages 编辑权限的 Token"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">域名 DNS 令牌 (Zone Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-orange-500 transition-all font-mono"
                value={localConfig.zoneToken}
                onChange={(e) => setLocalConfig({...localConfig, zoneToken: e.target.value})}
                placeholder="填写包含 DNS 编辑权限的 Token"
              />
            </div>
          </div>
        </section>

        {/* Basic Config */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <span className="text-lg">🎨</span> 界面与解析参数
          </h3>
          <div className="space-y-6 p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">分发主域名 (Parent Domain)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-purple-500 transition-all font-mono"
                value={localConfig.parentDomain}
                onChange={(e) => setLocalConfig({...localConfig, parentDomain: e.target.value})}
                placeholder="例如: hyeri.us.kg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">背景图片/视频 URL</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none dark:text-white text-sm focus:ring-2 ring-purple-500 transition-all font-mono"
                value={localConfig.backgroundUrl}
                onChange={(e) => setLocalConfig({...localConfig, backgroundUrl: e.target.value})}
                placeholder="支持直链图片或 MP4 视频"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Dynamic Paths - U1, U2, etc. */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg">🚀</span> 分发路径模板 (U1, U2...)
          </h3>
          <button 
            onClick={addPath}
            className="text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-6 py-2.5 rounded-xl hover:scale-105 transition-transform"
          >
            + 添加 U 槽位
          </button>
        </div>
        <div className="bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-5 font-black text-slate-500 uppercase text-[10px] tracking-widest">标签 (Label)</th>
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
                      placeholder="例如: uuid-or-path"
                    />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => removePath(idx)}
                      className="text-red-400 hover:text-red-600 font-bold text-xs"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {localConfig.paths.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic">尚未配置任何路径模板，请点击右上角添加</td>
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
