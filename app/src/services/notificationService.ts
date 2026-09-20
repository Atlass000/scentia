// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── REQUEST PERMISSION & GET TOKEN ────────────────────────────
export async function registerForPushNotifications(uid: string): Promise<string | null> {
  // Only works on physical device
  if (!Device.isDevice) {
    console.log('[Notifications] Push not available on simulator');
    return null;
  }

  // Check / request permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission denied');
    return null;
  }

  // Android channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('scentia-default', {
      name: 'Scentia',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b7355',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('scentia-weekly', {
      name: 'Weekly Picks',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Your weekly fragrance recommendations',
      sound: 'default',
    });
  }

  // Get push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  });
  const token = tokenData.data;

  // Save token to Firestore
  try {
    await updateDoc(doc(db, 'users', uid), {
      expoPushToken: token,
      pushEnabled: true,
      pushRegisteredAt: new Date(),
    });
    console.log('[Notifications] Token saved:', token);
  } catch (err) {
    console.error('[Notifications] Failed to save token:', err);
  }

  return token;
}

// ── DISABLE NOTIFICATIONS ─────────────────────────────────────
export async function disablePushNotifications(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    pushEnabled: false,
    expoPushToken: null,
  });
}

// ── NOTIFICATION LISTENER SETUP ───────────────────────────────
export function setupNotificationListeners(
  onReceive?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  const receiveListener = Notifications.addNotificationReceivedListener(
    notification => onReceive?.(notification)
  );
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => onResponse?.(response)
  );
  return () => {
    Notifications.removeNotificationSubscription(receiveListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

// ── LOCAL NOTIFICATION (for testing) ─────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body: string,
  delaySeconds = 5
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds },
  });
}
