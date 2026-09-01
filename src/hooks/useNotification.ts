/**
 * useNotification Hook
 * Hook لإدارة رسال الإعلامات
 */

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function useNotification(autoCloseDuration = 5000) {
  const { notification, clearNotification } = useUIStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(clearNotification, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [notification, autoCloseDuration, clearNotification]);

  return notification;
}
