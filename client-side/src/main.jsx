import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobile dynamic viewport height fix with visualViewport (reduces bottom gap on iOS/Android)
const setVh = () => {
  const vv = window.visualViewport;
  const height = vv ? vv.height : window.innerHeight;
  const unit = height * 0.01; // 1% of the visual viewport
  document.documentElement.style.setProperty('--vh', `${unit}px`);
  document.documentElement.style.setProperty('--app-vh', `${unit}px`);
};

// Use rAF to avoid layout thrash during resize
let resizeRaf;
const scheduleVh = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(setVh);
};

setVh();
window.addEventListener('resize', scheduleVh, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(setVh, 300));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', scheduleVh, { passive: true });
}

if (import.meta && import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', scheduleVh);
    window.removeEventListener('orientationchange', setVh);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', scheduleVh);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
