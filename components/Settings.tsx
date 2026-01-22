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
        alert("✅ 配置保存成功");
      }
    } catch (e) {
      alert("❌ 保存失败: " + e);
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
    setLocalConfig({ 
      ...localConfig, 
      paths: [...localConfig.paths, { label: 'U' + (localConfig.paths.length + 1), value: '' }] 
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
          <h2 className="text-2xl font-bold dark:text-white">系统环境设置</h2>
          <p className="text-slate-500 text-sm">配置 Cloudflare API 凭据及生成逻辑</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
        >
          {saving ? '正在保存...' : '保存配置'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API Credentials */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🔑</span> API 核心凭据
          </h3>
          <div className="space-y-5 p-6 bg-white/40 dark:bg-white/5 rounded-[32px] border border-white/20 shadow-sm">
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase">账户 ID (Account ID)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all"
                value={localConfig.accountId}
                onChange={(e) => setLocalConfig({...localConfig, accountId: e.target.value})}
                placeholder="Cloudflare Account ID"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase">Pages 令牌 (Pages API Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all"
                value={localConfig.pagesToken}
                onChange={(e) => setLocalConfig({...localConfig, pagesToken: e.target.value})}
                placeholder="包含 Pages 编辑权限的 Token"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase">DNS 令牌 (Zone API Token)</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all"
                value={localConfig.zoneToken}
                onChange={(e) => setLocalConfig({...localConfig, zoneToken: e.target.value})}
                placeholder="包含 DNS 编辑权限的 Token"
              />
            </div>
          </div>
        </section>

        {/* Customization */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🎭</span> 界面与生成参数
          </h3>
          <div className="space-y-5 p-6 bg-white/40 dark:bg-white/5 rounded-[32px] border border-white/20 shadow-sm">
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase">生成器主域名 (Parent Domain)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all"
                value={localConfig.parentDomain}
                onChange={(e) => setLocalConfig({...localConfig, parentDomain: e.target.value})}
                placeholder="例如: hyeri.top"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase">自定义背景 (Image/Video URL)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white text-sm focus:ring-2 ring-blue-500 transition-all"
                value={localConfig.backgroundUrl}
                onChange={(e) => setLocalConfig({...localConfig, backgroundUrl: e.target.value})}
                placeholder="支持图片或视频直链"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Path List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🌐</span> 动态生成路径模板 (U1, U2...)
          </h3>
          <button 
            onClick={addPath}
            className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl hover:scale-105 transition-transform"
          >
            + 新增路径槽位
          </button>
        </div>
        <div className="bg-white/40 dark:bg-white/5 rounded-[32px] border border-white/20 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-8 py-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">标签 (如 U1)</th>
                <th className="px-8 py-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">路径值 (Path)</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {localConfig.paths.map((path, idx) => (
                <tr key={idx} className="hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <td className="px-8 py-4">
                    <input 
                      className="bg-transparent outline-none font-black dark:text-white w-full"
                      value={path.label}
                      onChange={(e) => updatePath(idx, 'label', e.target.value)}
                    />
                  </td>
                  <td className="px-8 py-4">
                    <input 
                      className="bg-transparent w-full outline-none font-mono text-slate-500 dark:text-slate-400"
                      value={path.value}
                      onChange={(e) => updatePath(idx, 'value', e.target.value)}
                      placeholder="输入路径部分"
                    />
                  </td>
                  <td className="px-8 py-4 text-right">
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
                  <td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic">尚未添加任何路径模板</td>
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