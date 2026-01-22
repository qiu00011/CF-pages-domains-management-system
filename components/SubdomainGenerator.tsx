import React, { useState } from 'react';
import { UserConfig } from '../types.ts';

interface SubdomainGeneratorProps {
  config: UserConfig;
}

const SubdomainGenerator: React.FC<SubdomainGeneratorProps> = ({ config }) => {
  const [dateStr, setDateStr] = useState<string>('');
  const [results, setResults] = useState<Array<{ label: string, value: string }>>([]);

  const randomLetters = (n: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let i = 0; i < n; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  };

  const handleGenerate = () => {
    const parts = dateStr.trim().split(".");
    if (parts.length !== 2) {
      alert("⚠️ 请使用 MM.DD 格式 (例如 08.15)");
      return;
    }

    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");

    const prefix = randomLetters(2) + month + randomLetters(2) + day + randomLetters(2);
    const parent = config.parentDomain || 'hyeri.top';
    const domain = `${prefix}.${parent}`;
    
    const res: Array<{ label: string, value: string }> = [
      { label: '生成的随机子域名', value: domain }
    ];

    (config.paths || []).forEach(p => {
      const pathVal = p.value.trim() || p.label;
      res.push({ label: `订阅链接 (${p.label})`, value: `https://${domain}/${pathVal}` });
    });

    setResults(res);
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black dark:text-white tracking-tight">调度中心</h2>
        <p className="text-slate-500 font-medium italic">基于日期算法动态生成分发地址</p>
      </div>

      <div className="bg-white/40 dark:bg-white/5 p-10 rounded-[50px] border border-white/20 shadow-2xl space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
            当前分发环境: <span className="text-blue-600 dark:text-blue-400">{config.parentDomain || '未设置'}</span>
          </label>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[24px] px-8 py-5 outline-none text-2xl font-mono dark:text-white shadow-inner focus:ring-4 ring-blue-500/10 transition-all" 
              placeholder="08.15" 
              value={dateStr} 
              onInput={(e: any) => setDateStr(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} 
            />
            <button onClick={handleGenerate} className="bg-blue-600 text-white px-10 rounded-[24px] font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">生成</button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/10 animate-fade-in">
            {results.map((r, i) => (
              <div key={i} className="p-6 bg-white/80 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-[32px] flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-sm">
                <div className="overflow-hidden pr-4">
                  <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{r.label}</div>
                  <div className="text-base font-mono truncate dark:text-slate-200 font-bold">{r.value}</div>
                </div>
                <button 
                  onClick={() => {navigator.clipboard.writeText(r.value); alert('📋 已复制')}} 
                  className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:bg-blue-600 hover:text-white transition-all shadow-inner"
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainGenerator;