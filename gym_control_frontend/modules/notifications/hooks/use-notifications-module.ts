import { useState } from "react";
import { useMarkNotificationRead, useUpdateNotificationPreferences } from "@/hooks/use-zudel-mutations";
import { useNotificationPreferences, useNotifications } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";

export function useNotificationsModule() {
  const notifications = useNotifications();
  const preferences = useNotificationPreferences();
  const markRead = useMarkNotificationRead();
  const updatePrefs = useUpdateNotificationPreferences();
  const user = useSessionStore((state) => state.user);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>([]);

  const visibleNotifications = (notifications.data ?? []).filter((item) => !hiddenNotificationIds.includes(item.id));

  const setEmailEnabled = (enabled: boolean) => {
    if (!user?.id) return;
    updatePrefs.mutate({ userId: user.id, emailEnabled: enabled });
  };

  const setPushEnabled = (enabled: boolean) => {
    if (!user?.id) return;
    updatePrefs.mutate({ userId: user.id, pushEnabled: enabled });
  };

  const setSmsEnabled = (enabled: boolean) => {
    if (!user?.id) return;
    updatePrefs.mutate({ userId: user.id, smsEnabled: enabled });
  };

  return {
    preferences,
    markRead,
    visibleNotifications,
    setHiddenNotificationIds,
    setEmailEnabled,
    setPushEnabled,
    setSmsEnabled,
  };
}
