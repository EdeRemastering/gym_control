import { FormEvent, useState } from "react";
import { useCreateUser, useUpdateUser } from "@/hooks/use-zudel-mutations";
import { useUsers } from "@/hooks/use-zudel-query";
import type { Role } from "@/lib/types";

export function useUsersModule() {
  const users = useUsers();
  const list = users.data ?? [];
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [form, setForm] = useState({ name: "", email: "", phone: "", bio: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [softDeletedIds, setSoftDeletedIds] = useState<string[]>([]);
  const [suspendedIds, setSuspendedIds] = useState<string[]>([]);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [pendingRenameUserId, setPendingRenameUserId] = useState<string | null>(null);
  const [pendingRoleUserId, setPendingRoleUserId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [roleValue, setRoleValue] = useState<Role>("CLIENT");
  const [activityUserId, setActivityUserId] = useState<string | null>(null);

  const editingUser = list.find((user) => user.id === editingId);
  const visibleUsers = list.filter((user) => !softDeletedIds.includes(user.id));

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createUser.mutateAsync({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
    });
    setForm({ name: "", email: "", phone: "", bio: "" });
  }

  async function onQuickRename(userId: string, nextName: string) {
    if (!nextName.trim()) return;
    await updateUser.mutateAsync({
      userId,
      data: { name: nextName.trim() },
    });
  }

  function toggleSelect(userId: string) {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  return {
    list,
    createUser,
    updateUser,
    form,
    setForm,
    editingId,
    setEditingId,
    selectedIds,
    setSelectedIds,
    softDeletedIds,
    setSoftDeletedIds,
    suspendedIds,
    setSuspendedIds,
    pendingBulkDelete,
    setPendingBulkDelete,
    pendingRenameUserId,
    setPendingRenameUserId,
    pendingRoleUserId,
    setPendingRoleUserId,
    renameValue,
    setRenameValue,
    roleValue,
    setRoleValue,
    activityUserId,
    setActivityUserId,
    editingUser,
    visibleUsers,
    onCreate,
    onQuickRename,
    toggleSelect,
  };
}
