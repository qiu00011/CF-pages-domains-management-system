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
    setLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchProjects = async () => {
    if (!config.accountId || !config.pagesToken) return;
    setLoading(true);
    addLog("同步云端项目列表...");
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
        addLog(`获取到 ${data.result.length} 个项目`);
      }
    } catch (err) {
      addLog(`连接请求异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async (projName: string) => {
    if (!projName) return;
    setLoading(true);
    addLog(`读取项目 [${projName}] 绑定列表...`);
    try {
      const resp = await fetch(`/api/cf/accounts/${config.accountId}/pages/projects/${projName}/domains`, {
        headers: { 'X-Pages-Token': config.pagesToken, 'X-Account-Id': config.accountId }
      });
      const data = await resp.json();
      if (data.success) {
        setDomains(data.result);
        addLog("列表刷新成功");
      }
    } catch (err) {
      addLog(`拉取域名失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain || !selectedProject) return;
    setLoading(true);
    addLog(`开始绑定: ${newDomain}`);
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
        addLog(`✅ 域名绑定任务成功`);
        setNewDomain('');
        fetchDomains(selectedProject);
      } else {
        addLog(`❌ 绑定失败: ${data.errors?.[0]?.message || '未知错误'}`);
      }
    } catch (err) {
      addLog(`⚠️ 异常中断: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async (domainName: string) => {
    if (!confirm(`确定要移除 ${domainName} 吗？`)) return;
    setLoading(true);
    addLog(`解绑域名: ${domainName}`);
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
        addLog(`✅ 域名已移除`);
        fetchDomains(selectedProject);
      }
    } catch (err) {
      addLog(`⚠️ 注销异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [config.accountId, config.pagesToken]);
  useEffect(() => { if (selectedProject) fetchDomains(selectedProject); }, [selectedProject]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">当前 Pages 项目</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 font-bold text-sm outline-none focus:ring-2 ring-blue-500/20"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.length === 0 && <option>加载中...</option>}
              {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">新增绑定域名</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 font-bold text-sm outline-none focus:ring-2 ring-blue-500/20 mb-4"
              placeholder="v2.domain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <button 
              onClick={addDomain}
              disabled={loading || !newDomain}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              确认添加
            </button>
          </div>

          <div className="bg-slate-900 text-slate-400 p-4 rounded-xl text-[10px] font-mono leading-relaxed h-48 overflow-y-auto custom-scroll">
             <div className="text-slate-500 border-b border-slate-800 pb-1 mb-2 uppercase font-black tracking-widest">系统日志</div>
             {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
             {logs.length === 0 && <div className="italic">等待操作...</div>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">已绑定域名列表</span>
            <button onClick={() => fetchDomains(selectedProject)} className="text-blue-500 text-[10px] font-black hover:underline uppercase">刷新列表</button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[500px]">
            {domains.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-4xl mb-4 opacity-20">📭</span>
                <p className="text-xs font-bold">暂无绑定域名</p>
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">域名地址</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">状态</th>
                  <th className="px-6 py-3 border-b border-slate-100 dark:border-slate-800"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {domains.map(d => (
                  <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm dark:text-slate-200">{d.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        d.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                      }`}>
                        {d.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeDomain(d.name)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainManager;