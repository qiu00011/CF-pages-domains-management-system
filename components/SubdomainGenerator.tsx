
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
      alert("⚠️ 请按照 MM.DD 格式输入，例如 05.20");
      return;
    }

    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");

    // 生成逻辑: 随机2位 + 月份 + 随机2位 + 日期 + 随机2位
    const prefix = randomLetters(2) + month + randomLetters(2) + day + randomLetters(2);
    const parent = config.parentDomain || 'hyeri.top';
    const fullSubdomain = `${prefix}.${parent}`;
    
    const newResults = [
      { label: '生成的随机子域名', value: fullSubdomain }
    ];

    // 关键修复: 检测配置中有几个 U 槽位，就生成几个对应的 URL
    if (config.paths && config.paths.length > 0) {
      config.paths.forEach(p => {
        // 如果用户没填路径值，默认使用标签名
        const pathValue = p.value.trim() || p.label;
        newResults.push({
          label: `订阅链接 (${p.label})`,
          value: `https://${fullSubdomain}/${pathValue}`
        });
      });
    }

    setResults(newResults);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 已复制链接');
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 animate-fade-in">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black dark:text-white tracking-tight">随机域名调度系统</h2>
        <p className="text-slate-500 font-medium">基于日期算法生成的唯一分发地址</p>
      </div>

      <div className="bg-white/40 dark:bg-white/5 p-10 rounded-[50px] border border-white/20 shadow-2xl space-y-8">
        <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800/20">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-[0.2em]">当前根域名环境</span>
            <span className="font-mono text-lg text-blue-600 dark:text-blue-400 font-black">{config.parentDomain || '未设置'}</span>
          </div>
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-black text-slate-700 dark:text-slate-300 pl-2">输入日期 (MM.DD)</label>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[20px] px-6 py-5 outline-none text-2xl font-mono dark:text-white focus:ring-4 ring-blue-500/20 transition-all placeholder:opacity-30"
              placeholder="08.15"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-[20px] font-black shadow-xl shadow-blue-500/30 active:scale-95 transition-all text-lg"
            >
              生成
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/10 animate-fade-in">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">解析输出列表</label>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">已就绪</span>
            </div>
            <div className="space-y-3">
              {results.map((res, i) => (
                <div key={i} className="group p-5 bg-white/80 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-[24px] flex items-center justify-between hover:border-blue-400/50 transition-all shadow-sm">
                  <div className="flex flex-col gap-1 overflow-hidden pr-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{res.label}</span>
                    <span className="text-base font-mono truncate dark:text-slate-100 font-medium">{res.value}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(res.value)}
                    className="flex-shrink-0 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-inner group-hover:scale-105"
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
