
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("CF Pages Hub: 正在初始化...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("未找到根节点 #root");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("CF Pages Hub: 渲染指令已发出");
  } catch (error) {
    console.error("React 渲染错误:", error);
    rootElement.innerHTML = `
      <div style="display: flex; height: 100vh; align-items: center; justify-content: center; background: #0f172a; color: #ef4444; font-family: sans-serif; text-align: center; padding: 20px;">
        <div style="max-width: 600px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">系统初始化失败</h1>
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px;">请检查控制台 (F12) 获取详细信息</p>
          <div style="text-align: left; background: #1e293b; padding: 15px; border-radius: 8px; overflow: auto; color: #cbd5e1; font-size: 12px; font-mono: monospace;">
            ${error.message}
          </div>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            重试加载
          </button>
        </div>
      </div>
    `;
  }
}
