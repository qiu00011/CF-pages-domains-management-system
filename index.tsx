import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🚀 [子怡云] 核心系统已启动");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}