"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useMarkNotificationRead,
  useUpdateNotificationPreferences,
} from "@/hooks/use-zudel-mutations";
import { useNotifications } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";

export function NotificationFlow() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const updatePrefs = useUpdateNotificationPreferences();
  const user = useSessionStore((state) => state.user);
  const firstUnread = (notifications.data ?? []).find((item) => !item.isRead);

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Notification Flow</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={markRead.isPending}
          onClick={() =>
            firstUnread &&
            markRead.mutate({ notificationId: firstUnread.id, isRead: true })
          }
        >
          Marcar primera no leída
        </Button>
        <Button
          size="sm"
          variant="ghost"
          loading={updatePrefs.isPending}
          onClick={() =>
            user?.id &&
            updatePrefs.mutate({
              userId: user.id,
              pushEnabled: true,
              emailEnabled: true,
              smsEnabled: false,
            })
          }
        >
          Actualizar preferencias
        </Button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Notificaciones totales: {(notifications.data ?? []).length}
      </p>
    </Card>
  );
}
