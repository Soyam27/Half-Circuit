import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Adds or removes a class on <html> to hide scrollbar only on the landing (hero) page
export default function ScrollBarToggler() {
  const { pathname } = useLocation();

  useEffect(() => {
    const rootEl = document.documentElement;
    if (pathname === '/') {
      rootEl.classList.add('hide-scrollbar');
    } else {
      rootEl.classList.remove('hide-scrollbar');
    }
    return () => {
      rootEl.classList.remove('hide-scrollbar');
    };
  }, [pathname]);

  return null;
}
