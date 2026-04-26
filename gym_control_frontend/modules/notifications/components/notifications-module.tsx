"use client";

import { AlertsFilters } from "@/modules/notifications/components/alerts-filters";
import { AlertsHeader } from "@/modules/notifications/components/alerts-header";
import { AlertsList } from "@/modules/notifications/components/alerts-list";
import { AlertsSidebar } from "@/modules/notifications/components/alerts-sidebar";
import { AlertsStatsCards } from "@/modules/notifications/components/alerts-stats-cards";
import { AlertsTabs } from "@/modules/notifications/components/alerts-tabs";
import { CreateAlertDialog } from "@/modules/notifications/components/create-alert-dialog";
import { useAlertsModule } from "@/modules/notifications/hooks/use-alerts-module";

export function NotificationsModule() {
  const alertsModule = useAlertsModule();

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-3">
        <AlertsHeader
          search={alertsModule.filters.search}
          onSearchChange={(search) => alertsModule.setFilters({ search })}
          onOpenCreate={() => alertsModule.setCreateDialogOpen(true)}
        />
        <AlertsStatsCards stats={alertsModule.stats} />
        <AlertsTabs activeTab={alertsModule.activeTab} stats={alertsModule.stats} onChange={alertsModule.setActiveTab} />
        <AlertsFilters
          filters={alertsModule.filters}
          branches={alertsModule.branchOptions}
          owners={alertsModule.ownerOptions}
          onFilterChange={alertsModule.setFilters}
          onReset={alertsModule.resetFilters}
        />
        <AlertsList
          alerts={alertsModule.alerts}
          isLoading={alertsModule.isLoading}
          onMarkRead={(alertId) => alertsModule.markRead.mutate({ notificationId: alertId, isRead: true })}
        />
      </div>
      <AlertsSidebar
        stats={alertsModule.stats}
        activity={alertsModule.recentActivity}
        onMarkAllRead={alertsModule.markAllAsRead}
        onCreateAlert={() => alertsModule.setCreateDialogOpen(true)}
      />
      <CreateAlertDialog
        open={alertsModule.isCreateDialogOpen}
        onOpenChange={alertsModule.setCreateDialogOpen}
        onSubmit={alertsModule.createAlert}
      />
    </div>
  );
}
