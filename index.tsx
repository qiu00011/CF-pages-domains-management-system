import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 [子怡云] 核心系统正在挂载...");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("✅ [子怡云] 渲染指令已发出，雅黑字体就绪");
} else {
  console.error("❌ [子怡云] 找不到挂载点 #root");
}