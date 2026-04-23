"use client";

import { BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useMarkNotificationRead,
  useUpdateNotificationPreferences,
} from "@/hooks/use-gym-mutations";
import {
  useNotificationPreferences,
  useNotifications,
} from "@/hooks/use-gym-query";
import { useSessionStore } from "@/lib/session-store";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { NotificationFlow } from "@/modules/notifications/flows/notification-flow";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import { useState } from "react";

export function NotificationsModule({ role }: ModuleShellProps) {
  const notifications = useNotifications();
  const preferences = useNotificationPreferences();
  const markRead = useMarkNotificationRead();
  const updatePrefs = useUpdateNotificationPreferences();
  const user = useSessionStore((state) => state.user);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>([]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Centro de notificaciones</p>
          <BellRing className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Revisa primero lo no leído y marca como leído cuando termines.
        </p>
        <div className="mt-3 space-y-2">
          {(notifications.data ?? []).filter((item) => !hiddenNotificationIds.includes(item.id)).length ? (
            (notifications.data ?? [])
              .filter((item) => !hiddenNotificationIds.includes(item.id))
              .map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">{item.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase text-[var(--muted)]">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={item.isRead ? "ghost" : "secondary"}
                        onClick={() => markRead.mutate({ notificationId: item.id, isRead: true })}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {item.isRead ? "Leída" : "Marcar leída"}
                      </Button>
                      <EntityActionMenu
                        title="Notificación"
                        actions={[
                          {
                            id: `mark-unread-${item.id}`,
                            label: "Marcar no leída",
                            kind: "state",
                            run: () => markRead.mutate({ notificationId: item.id, isRead: false }),
                          },
                          {
                            id: `delete-${item.id}`,
                            label: "Ocultar",
                            kind: "delete",
                            danger: true,
                            requiresConfirm: true,
                            run: () => setHiddenNotificationIds((prev) => [...prev, item.id]),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
              No tienes notificaciones pendientes. Cuando llegue una nueva, aparecerá aquí.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Preferencias</p>
        <div className="mt-3 space-y-2 text-sm text-white">
          <label className="flex items-center justify-between">
            <span>Email</span>
            <input
              type="checkbox"
              checked={preferences.data?.emailEnabled ?? true}
              onChange={(event) =>
                user?.id &&
                updatePrefs.mutate({
                  userId: user.id,
                  emailEnabled: event.target.checked,
                })
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Push</span>
            <input
              type="checkbox"
              checked={preferences.data?.pushEnabled ?? true}
              onChange={(event) =>
                user?.id &&
                updatePrefs.mutate({
                  userId: user.id,
                  pushEnabled: event.target.checked,
                })
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span>SMS</span>
            <input
              type="checkbox"
              checked={preferences.data?.smsEnabled ?? false}
              onChange={(event) =>
                user?.id &&
                updatePrefs.mutate({
                  userId: user.id,
                  smsEnabled: event.target.checked,
                })
              }
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Vista por rol: {role}</p>
      </Card>

      <div className="lg:col-span-3">
        <NotificationFlow />
      </div>
    </div>
  );
}
