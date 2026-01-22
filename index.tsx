import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("⚛️ React 19 引擎已就绪，正在挂载 App...");

const mount = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}