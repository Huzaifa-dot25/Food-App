import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAppDispatch } from '@/store';
import { addNotification, fetchUnreadCount } from '@/store/slices/notificationSlice';
import type { Notification } from '@/types/api.types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,
    shouldPlaySound:   true,
    shouldSetBadge:    true,
  }),
});

export function useNotifications() {
  const dispatch             = useAppDispatch();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener     = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listen for incoming notifications while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as any;
        dispatch(addNotification({
          id:          Date.now(),
          title:       notification.request.content.title ?? '',
          body:        notification.request.content.body  ?? '',
          type:        data?.type ?? 'System',
          referenceId: data?.referenceId ?? null,
          isRead:      false,
          createdAt:   new Date().toISOString(),
        }));
        dispatch(fetchUnreadCount());
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [dispatch]);

  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  return { registerForPushNotifications };
}
