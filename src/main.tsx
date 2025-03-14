import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Make sure the root element fills the whole viewport
document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';
document.body.style.padding = '0';

if (document.getElementById('root')) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.style.height = '100%';
    rootElement.style.width = '100%';
    rootElement.style.margin = '0';
    rootElement.style.padding = '0';
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);