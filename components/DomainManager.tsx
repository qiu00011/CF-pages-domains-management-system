
import React, { useState, useEffect } from 'react';
import { UserConfig, ProjectInfo, DomainInfo } from '../types.ts';

interface DomainManagerProps {
  config: UserConfig;
}

const DomainManager: React.FC<DomainManagerProps> = ({ config }) => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [newDomain, setNewDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchProjects = async () => {
    if (!config.accountId || !config.pagesToken) return;
    setLoading(true);
    addLog("正在获取 Cloudflare 项目列表...");
    try {
      const resp = await fetch(`/api/cf/accounts/${config.accountId}/pages/projects`, {
        headers: { 'X-Pages-Token': config.pagesToken, 'X-Account-Id': config.accountId }
      });
      const data = await resp.json();
      if (data.success) {
        setProjects(data.result);
        if (data.result.length > 0 && !selectedProject) {
          setSelectedProject(data.result[0].name);
        }
        addLog(`成功获取 ${data.result.length} 个项目`);
      }
    } catch (err) {
      addLog(`错误: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async (projName: string) => {
    if (!projName) return;
    setLoading(true);
    addLog(`正在刷新项目 [${projName}] 的自定义域名...`);
    try {
      const resp = await fetch(`/api/cf/accounts/${config.accountId}/pages/projects/${projName}/domains`, {
        headers: { 'X-Pages-Token': config.pagesToken, 'X-Account-Id': config.accountId }
      });
      const data = await resp.json();
      if (data.success) {
        setDomains(data.result);
        addLog("域名列表已更新");
      }
    } catch (err) {
      addLog(`获取域名失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain || !selectedProject) return;
    setLoading(true);
    addLog(`准备添加域名 ${newDomain} 到项目 ${selectedProject}...`);
    try {
      const resp = await fetch(`/api/cf/accounts/${config.accountId}/pages/projects/${selectedProject}/domains`, {
        method: 'POST',
        headers: { 
          'X-Pages-Token': config.pagesToken, 
          'X-Zone-Token': config.zoneToken, 
          'X-Account-Id': config.accountId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newDomain })
      });
      const data = await resp.json();
      if (data.success) {
        addLog(`✅ 域名添加成功！`);
        if (data.dns_created) {
          addLog(`🚀 DNS CNAME 记录已自动创建，指向目标: ${data.cname_target}`);
        } else {
          addLog(`⚠️ DNS 记录未自动创建，请检查 Zone Token 权限或手动添加`);
        }
        setNewDomain('');
        fetchDomains(selectedProject);
      } else {
        addLog(`❌ 失败: ${data.errors?.[0]?.message || JSON.stringify(data.errors)}`);
      }
    } catch (err) {
      addLog(`⚠️ 异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async (domainName: string) => {
    if (!confirm(`确定要移除域名 ${domainName} 吗？\n系统将尝试同步清理对应的 DNS 记录。`)) return;
    setLoading(true);
    addLog(`正在移除域名 ${domainName}...`);
    try {
      const resp = await fetch(`/api/cf/accounts/${config.accountId}/pages/projects/${selectedProject}/domains/${domainName}`, {
        method: 'DELETE',
        headers: { 
          'X-Pages-Token': config.pagesToken, 
          'X-Zone-Token': config.zoneToken, 
          'X-Account-Id': config.accountId 
        }
      });
      const data = await resp.json();
      if (data.success) {
        addLog(`✅ ${domainName} 已成功从项目中断开`);
        if (data.dns_deleted) addLog(`🗑️ 相关的 DNS 记录已自动清理`);
        fetchDomains(selectedProject);
      }
    } catch (err) {
      addLog(`⚠️ 异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [config.accountId, config.pagesToken]);

  useEffect(() => {
    if (selectedProject) fetchDomains(selectedProject);
  }, [selectedProject]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black dark:text-white tracking-tight">域名控制</h2>
          <p className="text-slate-500 text-sm font-medium">绑定与管理 Pages 自定义域名解析</p>
        </div>
        <button 
          onClick={fetchProjects}
          className="px-6 py-3 bg-white/50 dark:bg-white/10 rounded-2xl text-xs font-black hover:bg-white transition-all dark:text-white border border-white/20 shadow-sm"
        >
          同步云端数据
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">当前操作项目</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold text-sm shadow-inner appearance-none"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.length === 0 && <option value="">-- 请先同步数据 --</option>}
              {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">快速绑定新域名</label>
            <div className="flex gap-3">
              <input 
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none dark:text-white font-mono text-sm shadow-inner"
                placeholder="例如 v2.hyeri.us.kg"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              />
              <button 
                onClick={addDomain}
                disabled={loading || !newDomain}
                className="bg-blue-600 text-white px-10 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                添加
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 font-bold flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                系统将自动通过 API 解析到项目的 subdomain 域名
            </p>
          </div>
        </div>

        <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 min-h-[350px] flex flex-col shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-1">已绑定的解析列表</label>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scroll">
            {domains.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                <span className="text-4xl mb-4">☁️</span>
                <span className="text-sm">暂无自定义解析数据</span>
              </div>
            ) : (
              domains.map(d => (
                <div key={d.name} className="flex items-center justify-between p-5 bg-white/80 dark:bg-black/30 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-blue-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="font-black text-sm dark:text-white font-mono">{d.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'active' ? 'bg-emerald-500' : 'bg-orange-400'}`}></span>
                        <span className={`text-[9px] uppercase font-black tracking-widest ${
                        d.status === 'active' ? 'text-emerald-500' : 'text-orange-400'
                        }`}>
                        {d.status === 'active' ? '已激活' : '验证中'}
                        </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeDomain(d.name)}
                    className="text-red-400 hover:text-red-600 p-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    断开
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">系统执行轨迹 (Terminal Logs)</label>
        <div className="bg-slate-950 text-emerald-400 p-6 rounded-[32px] font-mono text-[10px] h-40 overflow-y-auto shadow-2xl border border-white/5 custom-scroll leading-relaxed">
          {logs.map((log, i) => <div key={i} className="mb-1 opacity-90">{log}</div>)}
          {logs.length === 0 && <div className="text-slate-700 italic">等待系统指令下达...</div>}
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
