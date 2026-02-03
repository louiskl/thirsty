import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface UseNotificationsOptions {
  settings: UserSettings;
  onNotificationReceived?: () => void;
}

export function useNotifications({
  settings,
  onNotificationReceived,
}: UseNotificationsOptions) {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }
    
    // Android requires a channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('water-reminders', {
        name: 'Wasser-Erinnerungen',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4FC3F7',
      });
    }
    
    return true;
  }, []);

  // Schedule repeating notifications
  const scheduleNotifications = useCallback(async () => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.notificationsEnabled) {
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    const intervalMinutes = settings.notificationInterval;
    const messages = [
      'Zeit, etwas Wasser zu trinken! 💧',
      'Denk daran, hydratisiert zu bleiben! 🌊',
      'Ein Glas Wasser gefällig? 💦',
      'Trink-Pause! Dein Körper wird es dir danken. 💙',
      'Wasser-Alarm! Zeit für einen Schluck. 🚰',
    ];

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Thirsty',
        body: messages[Math.floor(Math.random() * messages.length)],
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalMinutes * 60,
        repeats: true,
      },
    });

    console.log(`Notifications scheduled every ${intervalMinutes} minutes`);
  }, [settings.notificationsEnabled, settings.notificationInterval, requestPermissions]);

  // Cancel all notifications
  const cancelNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  }, []);

  // Setup notification listeners
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.();
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [onNotificationReceived]);

  // Schedule/cancel notifications when settings change
  useEffect(() => {
    if (settings.notificationsEnabled) {
      scheduleNotifications();
    } else {
      cancelNotifications();
    }
  }, [
    settings.notificationsEnabled,
    settings.notificationInterval,
    scheduleNotifications,
    cancelNotifications,
  ]);

  return {
    requestPermissions,
    scheduleNotifications,
    cancelNotifications,
  };
}
