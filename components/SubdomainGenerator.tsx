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
    const parts = dateStr.split(".");
    if (parts.length !== 2) {
      alert("⚠️ 请输入正确格式 (MM.DD)");
      return;
    }

    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");

    // Logic: 2letters + MM + 2letters + DD + 2letters
    const prefix = randomLetters(2) + month + randomLetters(2) + day + randomLetters(2);
    const parent = config.parentDomain || 'hyeri.top';
    const fullSubdomain = `${prefix}.${parent}`;
    
    const newResults = [
      { label: '生成的子域名', value: fullSubdomain }
    ];

    // Detect how many U(x) paths are defined and generate URLs
    config.paths.forEach(p => {
      newResults.push({
        label: `URL (${p.label})`,
        value: `https://${fullSubdomain}/${p.value}`
      });
    });

    setResults(newResults);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('📋 已复制到剪贴板');
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold dark:text-white tracking-tight">随机域名分发</h2>
        <p className="text-slate-500">基于日期生成的动态地址解析方案</p>
      </div>

      <div className="bg-white/40 dark:bg-white/5 p-8 rounded-[40px] border border-white/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
          <span className="text-[11px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">当前根域名</span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{config.parentDomain || '未设置'}</span>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300">指定日期 (MM.DD)</label>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none text-xl font-mono dark:text-white focus:ring-2 ring-blue-500 transition-all"
              placeholder="例如 05.20"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              一键生成
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/10">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">解析结果 ({results.length})</label>
            <div className="space-y-3">
              {results.map((res, i) => (
                <div key={i} className="group p-4 bg-white/60 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:border-blue-400/50 transition-colors">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{res.label}</span>
                    <span className="text-sm font-mono truncate dark:text-slate-200">{res.value}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(res.value)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainGenerator;