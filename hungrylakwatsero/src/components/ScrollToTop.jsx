import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset scroll position on route change and close any stuck overflow locks. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.remove('modal-open');
    if (!document.querySelector('[data-modal-open="true"]')) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [pathname]);

  return null;
}
