"use client";

import { AccessPolicyCard } from "@/modules/users/components/access-policy-card";
import { ActivityTimeline } from "@/modules/users/components/activity-timeline";
import { AssignRoleModal } from "@/modules/users/components/assign-role-modal";
import { BranchDistributionChart } from "@/modules/users/components/branch-distribution-chart";
import { CreateUserModal } from "@/modules/users/components/create-user-modal";
import { EditUserModal } from "@/modules/users/components/edit-user-modal";
import { QuickActionsPanel } from "@/modules/users/components/quick-actions-panel";
import { RolesPermissionsPanel } from "@/modules/users/components/roles-permissions-panel";
import { UsersFilters } from "@/modules/users/components/users-filters";
import { UsersHeader } from "@/modules/users/components/users-header";
import { UsersStatsCards } from "@/modules/users/components/users-stats-cards";
import { UsersTable } from "@/modules/users/components/users-table";
import { UsersTabs } from "@/modules/users/components/users-tabs";
import { UsersAnalyticsChart } from "@/modules/users/components/users-analytics-chart";
import { useUsersManagementModule } from "@/modules/users/hooks/use-users-management-module";
import { useState } from "react";

export function UsersModule() {
  const usersModule = useUsersManagementModule();
  const [createUserOpen, setCreateUserOpen] = useState(false);

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">
        <UsersHeader
          search={usersModule.filters.search}
          onSearch={(search) => usersModule.setFilters({ search })}
          onCreateUser={() => setCreateUserOpen(true)}
        />
        <UsersStatsCards stats={usersModule.stats} />
        <UsersTabs
          activeTab={usersModule.activeTab}
          counters={{
            all: usersModule.stats.total,
            active: usersModule.stats.active,
            inactive: usersModule.users.filter((user) => user.status === "inactive").length,
            blocked: usersModule.stats.blocked,
            pending: usersModule.stats.invitations,
          }}
          onChange={usersModule.setActiveTab}
        />
        <UsersFilters
          filters={usersModule.filters}
          branches={usersModule.branchOptions}
          onChange={usersModule.setFilters}
          onReset={usersModule.resetFilters}
        />
        <UsersTable
          users={usersModule.users}
          selectedIds={usersModule.selectedIds}
          isLoading={usersModule.isLoading}
          onToggleSelect={usersModule.toggleSelect}
          onEdit={usersModule.setEditingUser}
          onAssignRole={usersModule.setAssignRoleUser}
        />
      </div>

      <div className="space-y-3">
        <QuickActionsPanel
          onCreateUser={() => setCreateUserOpen(true)}
          onCreateRole={() => usersModule.openCreateRole(true)}
        />
        <RolesPermissionsPanel
          roles={usersModule.roles}
          selectedRole={usersModule.selectedRole}
          catalog={usersModule.permissionCatalog}
          isCreateOpen={usersModule.isCreateRoleOpen}
          isCreatePermissionOpen={usersModule.isCreatePermissionOpen}
          isUpdatingPermissions={usersModule.isUpdatingPermissions}
          onSelectRole={usersModule.selectRole}
          onTogglePermission={usersModule.toggleRolePermission}
          onOpenCreate={usersModule.openCreateRole}
          onCreateRole={usersModule.createRole}
          onOpenCreatePermission={usersModule.openCreatePermission}
          onCreatePermission={usersModule.createPermission}
        />
        <ActivityTimeline items={usersModule.activity} />
        <UsersAnalyticsChart stats={usersModule.stats} />
        <BranchDistributionChart users={usersModule.users} />
        <AccessPolicyCard />
      </div>

      <CreateUserModal
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSubmit={usersModule.createUserFromModal}
      />
      <EditUserModal
        user={usersModule.editingUser}
        onClose={() => usersModule.setEditingUser(null)}
        onSave={usersModule.saveUserEdit}
      />
      <AssignRoleModal
        user={usersModule.assignRoleUser}
        roles={usersModule.roles}
        onClose={() => usersModule.setAssignRoleUser(null)}
        onAssign={usersModule.assignRole}
      />
    </div>
  );
}
