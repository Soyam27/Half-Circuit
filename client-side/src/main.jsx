import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobile dynamic viewport height fix (avoids bottom white gap on real devices)
const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', () => setTimeout(setVh, 250));
// Cleanup listener on hot reload (vite) / module dispose
if (import.meta && import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', setVh);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
