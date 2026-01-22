
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 CF Pages Hub: 脚本加载成功，准备挂载...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ 严重错误: 页面中未找到 ID 为 'root' 的挂载点");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ CF Pages Hub: React 渲染指令已下达");
  } catch (error) {
    console.error("💥 React 渲染过程中发生异常:", error);
    rootElement.innerHTML = `
      <div style="display: flex; height: 100vh; align-items: center; justify-content: center; background: #fef2f2; color: #991b1b; text-align: center; padding: 20px;">
        <div>
          <h2 style="font-size: 20px; font-bold: 700;">应用启动失败</h2>
          <p style="font-size: 14px; margin-top: 10px;">错误详情: ${error.message}</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">刷新重试</button>
        </div>
      </div>
    `;
  }
}
