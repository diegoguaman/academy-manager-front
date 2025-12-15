'use client';

import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@/shared/stores/notification-store';

/**
 * Componente que muestra las notificaciones globales
 * Integrado con Zustand store para gestionar el estado de las notificaciones
 * Utiliza Material UI Snackbar para mostrar notificaciones toast
 */
export function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}

