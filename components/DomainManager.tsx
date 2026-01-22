
import React, { useState, useEffect } from 'react';
import { UserConfig, ProjectInfo, DomainInfo } from '../types';

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
    addLog("正在获取项目列表...");
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
        addLog("项目列表获取完成");
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
    addLog(`正在获取 ${projName} 的域名...`);
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
    addLog(`尝试添加域名 ${newDomain}...`);
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
        addLog(`域名添加成功: ${data.dns_created ? 'DNS记录已同步' : '需手动配置DNS'}`);
        setNewDomain('');
        fetchDomains(selectedProject);
      } else {
        addLog(`失败: ${JSON.stringify(data.errors)}`);
      }
    } catch (err) {
      addLog(`异常: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async (domainName: string) => {
    if (!confirm(`确定要移除域名 ${domainName} 吗？`)) return;
    setLoading(true);
    addLog(`正在移除 ${domainName}...`);
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
        addLog(`移除成功: ${data.dns_deleted ? 'DNS记录已清理' : 'DNS需手动处理'}`);
        fetchDomains(selectedProject);
      }
    } catch (err) {
      addLog(`异常: ${err}`);
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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Cloudflare Pages 控制台</h2>
          <p className="text-slate-500 text-sm">管理您的 Pages 项目和自定义域名</p>
        </div>
        <button 
          onClick={fetchProjects}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 transition-colors dark:text-white"
        >
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Selector & Add Domain */}
        <div className="space-y-4">
          <div className="p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">选择项目</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.length === 0 && <option value="">-- 请先获取项目 --</option>}
              {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">快捷添加域名</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none dark:text-white"
                placeholder="sub.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <button 
                onClick={addDomain}
                disabled={loading || !newDomain}
                className="bg-blue-600 text-white px-6 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                添加
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">* 自动配置匹配 Zone 的 CNAME 记录（如有权限）</p>
          </div>
        </div>

        {/* Domain List */}
        <div className="p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20 min-h-[300px] flex flex-col">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">当前已绑定域名</label>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] pr-2">
            {domains.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                <span>无数据</span>
              </div>
            ) : (
              domains.map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm dark:text-white">{d.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {d.status === 'active' ? '在线' : '等待验证'}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeDomain(d.name)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-xs"
                  >
                    断开
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">系统日志</label>
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs h-32 overflow-y-auto shadow-inner border border-white/5">
          {logs.map((log, i) => <div key={i} className="mb-1 leading-relaxed">{log}</div>)}
          {logs.length === 0 && <div className="text-slate-600">等待操作...</div>}
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
