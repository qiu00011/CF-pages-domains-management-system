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
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-950 to-emerald-950 opacity-80"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative glass w-full max-w-sm p-12 rounded-[48px] shadow-2xl text-center space-y-10 animate-fade-in border-white/5">
        <img 
          src="https://image.hyeri.us.kg/icon.png" 
          alt="Logo" 
          className="w-24 h-24 mx-auto rounded-[32px] shadow-2xl rotate-2 object-cover border-2 border-white/10" 
        />
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">子怡云</h2>
          <p className="text-slate-400 text-sm font-medium opacity-70">云端调度 实时控制系统</p>
        </div>

        <div className="space-y-5">
          <input 
            type="password"
            className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-5 text-center outline-none focus:ring-4 ring-blue-500/20 transition-all text-white font-tech text-lg`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black shadow-2xl shadow-blue-600/20 active:scale-95 transition-all text-base tracking-wide"
          >
            {loading ? '正在建立连接...' : '立即进入面板'}
          </button>
          {error && <p className="text-red-400 text-xs font-black animate-pulse uppercase tracking-widest">访问令牌验证失败</p>}
        </div>

        <div className="pt-4">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black">Secure Core v2.6</p>
        </div>
      </div>
    </div>
  );
};

export default Login;