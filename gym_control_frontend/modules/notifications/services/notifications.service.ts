import { api } from "@/lib/api/services";

export const notificationsService = {
  list: api.notifications,
  markRead: api.markNotificationRead,
  preferences: api.notificationPreferences,
  updatePreferences: api.updateNotificationPreferences,
};
