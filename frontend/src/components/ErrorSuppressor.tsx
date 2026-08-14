'use client';

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWindowError = (event: ErrorEvent) => {
      // Suppress raw DOM Event objects or broken image 404 events from showing Next.js dev overlay modal
      if (!event.error || event.error.toString() === '[object Event]' || event.message === 'Script error.') {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && (event.reason.toString() === '[object Event]' || event.reason instanceof Event)) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  return null;
}
