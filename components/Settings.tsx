
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
        alert("配置保存成功");
      }
    } catch (e) {
      alert("保存失败: " + e);
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
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">系统配置</h2>
          <p className="text-slate-500 text-sm">配置 Cloudflare API 及子域名生成参数</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? '正在保存...' : '保存至云端'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Cloudflare Config */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🔐</span> 核心凭据
          </h3>
          <div className="space-y-4 p-6 bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20">
            <div>
              <label className="block text-xs font-semibold mb-1 dark:text-slate-300">Account ID</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                value={localConfig.accountId}
                onChange={(e) => setLocalConfig({...localConfig, accountId: e.target.value})}
                placeholder="Cloudflare 账户 ID"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 dark:text-slate-300">Pages API Token</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                value={localConfig.pagesToken}
                onChange={(e) => setLocalConfig({...localConfig, pagesToken: e.target.value})}
                placeholder="Cloudflare Pages 编辑权限令牌"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 dark:text-slate-300">Zone API Token</label>
              <input 
                type="password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                value={localConfig.zoneToken}
                onChange={(e) => setLocalConfig({...localConfig, zoneToken: e.target.value})}
                placeholder="Cloudflare DNS 编辑权限令牌"
              />
            </div>
          </div>
        </section>

        {/* Customization */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🎨</span> 个性化
          </h3>
          <div className="space-y-4 p-6 bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20">
            <div>
              <label className="block text-xs font-semibold mb-1 dark:text-slate-300">背景资源 URL</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                value={localConfig.backgroundUrl}
                onChange={(e) => setLocalConfig({...localConfig, backgroundUrl: e.target.value})}
                placeholder="支持图片或 mp4 视频直链"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 dark:text-slate-300">父域名 (Generator)</label>
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                value={localConfig.parentDomain}
                onChange={(e) => setLocalConfig({...localConfig, parentDomain: e.target.value})}
                placeholder="hyeri.us.kg"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Generator Paths */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>🔗</span> 生成路径 (Generator Paths)
          </h3>
          <button 
            onClick={addPath}
            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            + 添加路径
          </button>
        </div>
        <div className="bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold dark:text-slate-300">标识 (Label)</th>
                <th className="px-6 py-4 font-bold dark:text-slate-300">路径值 (Path Value)</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {localConfig.paths.map((path, idx) => (
                <tr key={idx} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      className="bg-transparent outline-none font-bold dark:text-white"
                      value={path.label}
                      onChange={(e) => updatePath(idx, 'label', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      className="bg-transparent w-full outline-none font-mono text-slate-500 dark:text-slate-400"
                      value={path.value}
                      onChange={(e) => updatePath(idx, 'value', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removePath(idx)}
                      className="text-red-400 hover:text-red-600 font-bold"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Settings;
