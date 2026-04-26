"use client";

import { useMemo } from "react";
import { subMinutes } from "date-fns";
import { useShallow } from "zustand/react/shallow";
import { useMarkNotificationRead } from "@/hooks/use-zudel-mutations";
import { useNotifications } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import { filterAlerts, getAlertStats, getBranchOptions, getOwnerOptions } from "@/modules/notifications/selectors/alerts.selectors";
import { useAlertsStore } from "@/modules/notifications/store/use-alerts-store";
import type { AlertItemView } from "@/modules/notifications/types/alerts.types";
import type { CreateAlertFormData } from "@/modules/notifications/schemas/alert.schema";

const PRIORITY_SEQUENCE: AlertItemView["priority"][] = ["critical", "important", "informative", "completed"];
const STATUS_SEQUENCE: AlertItemView["status"][] = ["pending", "in_review", "completed"];
const SCOPE_SEQUENCE: AlertItemView["scope"][] = ["payment", "attendance", "system", "training", "reminder"];
const BRANCHES = ["Sede Centro", "Sede Norte", "Sede Sur", "Sede Downtown"];
const OWNERS = ["Juan Pérez", "María García", "Admin", "Equipo Ops", "Sistema"];

function mapToAlertView(raw: { id: string; title: string; message: string; isRead: boolean; createdAt: string }, index: number): AlertItemView {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    isRead: raw.isRead,
    createdAt: raw.createdAt,
    priority: PRIORITY_SEQUENCE[index % PRIORITY_SEQUENCE.length],
    status: raw.isRead ? STATUS_SEQUENCE[(index + 1) % STATUS_SEQUENCE.length] : "pending",
    scope: SCOPE_SEQUENCE[index % SCOPE_SEQUENCE.length],
    branch: BRANCHES[index % BRANCHES.length],
    owner: OWNERS[index % OWNERS.length],
  };
}

export function useAlertsModule() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const currentUser = useSessionStore((state) => state.user);
  const { filters, activeTab, isCreateDialogOpen, localCreatedAlerts, setFilters, resetFilters, setActiveTab, setCreateDialogOpen, addLocalAlert } = useAlertsStore(
    useShallow((state) => ({
      filters: state.filters,
      activeTab: state.activeTab,
      isCreateDialogOpen: state.isCreateDialogOpen,
      localCreatedAlerts: state.localCreatedAlerts,
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
      setActiveTab: state.setActiveTab,
      setCreateDialogOpen: state.setCreateDialogOpen,
      addLocalAlert: state.addLocalAlert,
    })),
  );

  const localAlerts = useMemo<AlertItemView[]>(() => {
    const source = [
      ...localCreatedAlerts.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt,
      })),
      ...(notifications.data ?? []),
    ];
    const mapped = source.map((item, index) => mapToAlertView(item, index));
    localCreatedAlerts.forEach((customAlert) => {
      const target = mapped.find((item) => item.id === customAlert.id);
      if (!target) return;
      target.priority = customAlert.priority;
      target.scope = customAlert.scope;
      target.owner = customAlert.owner;
      target.branch = customAlert.branch;
    });
    return mapped;
  }, [localCreatedAlerts, notifications.data]);

  const filteredAlerts = useMemo(() => filterAlerts(localAlerts, filters), [localAlerts, filters]);
  const stats = useMemo(() => getAlertStats(localAlerts), [localAlerts]);
  const branchOptions = useMemo(() => getBranchOptions(localAlerts), [localAlerts]);
  const ownerOptions = useMemo(() => getOwnerOptions(localAlerts), [localAlerts]);

  const recentActivity = useMemo(
    () =>
      filteredAlerts.slice(0, 5).map((alert, index) => ({
        id: `activity-${alert.id}`,
        label: alert.title,
        description: `${alert.owner} · ${alert.branch}`,
        at: subMinutes(new Date(alert.createdAt), index * 5).toISOString(),
      })),
    [filteredAlerts],
  );

  const markAllAsRead = () => {
    filteredAlerts.filter((alert) => !alert.isRead).forEach((alert) => {
      markRead.mutate({ notificationId: alert.id, isRead: true });
    });
  };

  const createAlert = (payload: CreateAlertFormData) => {
    if (!currentUser?.id) return;
    const createdAt = new Date().toISOString();
    addLocalAlert({
        id: `temp-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        isRead: false,
        createdAt,
        priority: payload.priority,
        scope: payload.scope,
        owner: payload.owner,
        branch: payload.branch,
      });
    setCreateDialogOpen(false);
  };

  return {
    alerts: filteredAlerts,
    stats,
    filters,
    activeTab,
    isLoading: notifications.isLoading,
    isCreateDialogOpen,
    branchOptions,
    ownerOptions,
    recentActivity,
    setFilters,
    resetFilters,
    setActiveTab,
    setCreateDialogOpen,
    markAllAsRead,
    markRead,
    createAlert,
  };
}
