/**
 * Notification Component
 * مكون الإعلامات/الرسائل
 */

import { useNotification } from '../hooks/useNotification';
import './Notification.css';

export default function Notification() {
  const notification = useNotification();

  if (!notification) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {notification.type === 'success' && '✅'}
          {notification.type === 'error' && '❌'}
          {notification.type === 'warning' && '⚠️'}
          {notification.type === 'info' && 'ℹ️'}
        </span>
        <p>{notification.message}</p>
      </div>
    </div>
  );
}
