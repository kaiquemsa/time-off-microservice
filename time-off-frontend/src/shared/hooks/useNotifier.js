'use client';

import { useCallback, useState } from 'react';

export function useNotifier() {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((type, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  return {
    notifications,
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    info: (message) => notify('info', message),
  };
}
