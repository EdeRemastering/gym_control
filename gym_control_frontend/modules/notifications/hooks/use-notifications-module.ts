import { useNotificationPreferences, useNotifications } from "@/hooks/use-gym-query";

export function useNotificationsModule() {
  return {
    notificationsQuery: useNotifications(),
    preferencesQuery: useNotificationPreferences(),
  };
}
