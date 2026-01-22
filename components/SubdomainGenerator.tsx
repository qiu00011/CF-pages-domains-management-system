
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
      alert("请输入正确格式 (MM.DD)");
      return;
    }

    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");

    // Logic: 2letters + MM + 2letters + DD + 2letters
    const prefix = randomLetters(2) + month + randomLetters(2) + day + randomLetters(2);
    const fullSubdomain = `${prefix}.${config.parentDomain || 'hyeri.us.kg'}`;
    
    const newResults = [
      { label: '子域名', value: fullSubdomain }
    ];

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
    // Simple visual feedback could be added here
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold dark:text-white">随机子域名生成器</h2>
        <p className="text-slate-500">基于日期逻辑生成唯一的子域名及全套 URL</p>
      </div>

      <div className="bg-white/40 dark:bg-white/5 p-8 rounded-3xl border border-white/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">📍 当前父域名:</span>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{config.parentDomain || '加载中...'}</span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">输入日期 (格式 MM.DD)</label>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none text-lg font-mono dark:text-white"
              placeholder="例如 10.11"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all"
            >
              生成
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-4 animate-fade-in">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">生成结果</label>
            <div className="space-y-3">
              {results.map((res, i) => (
                <div key={i} className="group p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-colors">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{res.label}</span>
                    <span className="text-sm font-mono truncate dark:text-slate-200">{res.value}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(res.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:text-blue-600 transition-all"
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
