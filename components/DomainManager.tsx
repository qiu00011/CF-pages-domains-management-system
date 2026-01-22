
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
    addLog(`同步项目 [${projName}] 的自定义域名...`);
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
          addLog(`🚀 DNS 解析已修正，指向目标: ${data.cname_target}`);
        }
        setNewDomain('');
        fetchDomains(selectedProject);
      } else {
        addLog(`❌ 失败: ${data.errors?.[0]?.message || 'API 限制'}`);
      }
    } catch (err) {
      addLog(`⚠️ 异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async (domainName: string) => {
    if (!confirm(`确定要移除域名 ${domainName} 吗？`)) return;
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
        addLog(`✅ ${domainName} 已移除`);
        if (data.dns_deleted) addLog(`🗑️ 相关的 DNS 记录已自动清理`);
        fetchDomains(selectedProject);
      }
    } catch (err) {
      addLog(`⚠️ 异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [config.accountId, config.pagesToken]);
  useEffect(() => { if (selectedProject) fetchDomains(selectedProject); }, [selectedProject]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black dark:text-white tracking-tighter">域名控制</h2>
          <p className="text-slate-500 text-sm font-medium opacity-70">精准同步 Cloudflare Pages 自定义解析</p>
        </div>
        <button 
          onClick={fetchProjects}
          className="px-6 py-3 bg-white/50 dark:bg-white/10 rounded-2xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest border border-white/20 shadow-sm"
        >
          刷新云端
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">当前工作项目</label>
            <div className="relative">
                <select 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 outline-none dark:text-white font-black text-base shadow-inner appearance-none"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                >
                {projects.map(p => <option key={p.name} value={p.name} className="font-semibold">{p.name}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
            </div>
          </div>

          <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">绑定新解析</label>
            <div className="flex gap-4">
              <input 
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 outline-none dark:text-white font-semibold text-lg shadow-inner focus:ring-4 ring-blue-500/10 transition-all"
                placeholder="v2.domain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <button 
                onClick={addDomain}
                disabled={loading || !newDomain}
                className="bg-blue-600 text-white px-8 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                添加
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/20 min-h-[350px] flex flex-col shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 pl-1">活动域名列表</label>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scroll">
            {domains.map(d => (
              <div key={d.name} className="flex items-center justify-between p-6 bg-white/80 dark:bg-black/40 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-blue-500/40 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-base dark:text-white tracking-tight">{d.name}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                      <span className={`w-2 h-2 rounded-full ${d.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-400 animate-pulse'}`}></span>
                      <span className={`text-[9px] uppercase font-black tracking-widest ${d.status === 'active' ? 'text-emerald-500' : 'text-orange-400'}`}>
                        {d.status === 'active' ? 'ACTIVE' : 'VALIDATING'}
                      </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeDomain(d.name)}
                  className="text-red-400 hover:text-red-600 p-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Trace Terminal</label>
        <div className="bg-black/90 text-emerald-400 p-8 rounded-[40px] text-[11px] h-48 overflow-y-auto shadow-2xl border border-white/5 custom-scroll leading-relaxed font-semibold">
          {logs.map((log, i) => <div key={i} className="mb-1.5 opacity-80"><span className="text-slate-600 mr-2">»</span>{log}</div>)}
          {logs.length === 0 && <div className="text-slate-800 italic">SYSTEM IDLE...</div>}
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
