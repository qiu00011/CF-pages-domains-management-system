import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🚀 系统启动：微软雅黑字体已加载");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}