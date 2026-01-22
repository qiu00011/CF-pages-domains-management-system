import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 子怡云核心系统启动... 当前字体：微软雅黑/Microsoft YaHei");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("❌ 找不到根节点 #root");
}