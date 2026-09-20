// src/utils/haptics.ts
import * as ExpoHaptics from 'expo-haptics';

// Centralized haptic feedback — ensures consistency everywhere
export const haptics = {
  // Light tap — note chip selection, toggle
  select: () => ExpoHaptics.selectionAsync(),

  // Medium impact — primary button press, find button
  tap: () => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light),

  // Heavier — destructive action, save to favorites
  medium: () => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium),

  // Success — subscription complete, search done
  success: () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success),

  // Warning — limit reached, error
  warning: () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning),

  // Error — failed action
  error: () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error),
};
