
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(false);
    try {
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await resp.json();
      if (data.success) {
        sessionStorage.setItem('authenticated', 'true');
        onLoginSuccess();
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      {/* Dynamic backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-slate-900 to-emerald-900 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative glass w-full max-w-sm p-10 rounded-[40px] shadow-2xl text-center space-y-8 animate-fade-in border-white/10">
        <div className="w-20 h-20 bg-blue-600 mx-auto rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl rotate-3">
          CF
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold dark:text-white">身份认证</h2>
          <p className="text-slate-400 text-sm">Cloudflare Pages 空间站</p>
        </div>

        <div className="space-y-4">
          <input 
            type="password"
            className={`w-full bg-slate-100 dark:bg-black/40 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-5 py-4 text-center outline-none focus:ring-2 ring-blue-500 transition-all dark:text-white`}
            placeholder="输入访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {loading ? '正在进入...' : '立即进入系统'}
          </button>
          {error && <p className="text-red-500 text-xs font-semibold animate-pulse">密码验证失败，请重试</p>}
        </div>

        <div className="pt-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Access System v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
