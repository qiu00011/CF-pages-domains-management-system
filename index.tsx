
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 强制清除之前的加载提示
console.log("🚀 [System] 正在启动 React 引擎...");

const startApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("❌ [System] 未找到 DOM 挂载点 #root");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ [System] 应用挂载完成");
  } catch (error) {
    console.error("💥 [System] 渲染崩溃:", error);
    rootElement.innerHTML = `
      <div style="display: flex; height: 100vh; align-items: center; justify-content: center; background: #fff5f5; color: #c53030; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1 style="font-size: 20px;">系统初始化异常</h1>
          <pre style="text-align: left; background: #eee; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 10px;">${error.stack || error.message}</pre>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; border: none; background: #c53030; color: white; border-radius: 5px; cursor: pointer;">强制刷新</button>
        </div>
      </div>
    `;
  }
};

// 确保在 DOM 加载后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
