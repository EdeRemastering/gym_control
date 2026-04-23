"use client";

import { FormEvent, useState } from "react";
import { ActivitySquare, ShieldCheck, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUsers } from "@/hooks/use-gym-query";
import { useCreateUser, useUpdateUser } from "@/hooks/use-gym-mutations";
import { Button } from "@/components/ui/button";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import type { Role } from "@/lib/types";
import { OnboardingFlow } from "@/modules/users/flows/onboarding-flow";
import { BulkActionBar } from "@/modules/action-system/components/bulk-action-bar";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersModule({ role }: ModuleShellProps) {
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
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <UsersRound className="h-4 w-4 text-[var(--primary)]" />
          Usuarios
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Edita, cambia estado y gestiona varios usuarios en pocos pasos.
        </p>
        <div className="mt-4 space-y-3">
          {visibleUsers.length ? (
            visibleUsers.map((user) => (
              <article key={user.id} className="rounded-2xl border border-[var(--border)] bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      className="text-left text-sm font-medium text-white underline-offset-2 hover:underline"
                      onClick={() => {
                        setEditingId(user.id);
                        setPendingRenameUserId(user.id);
                        setRenameValue(user.name);
                      }}
                    >
                      {user.name}
                    </button>
                    <p className="text-xs text-[var(--muted)]">{user.email}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      {user.role ?? "N/A"} ·{" "}
                      <span
                        className={
                          suspendedIds.includes(user.id) ? "text-gray-300" : "text-emerald-300"
                        }
                      >
                        {suspendedIds.includes(user.id) ? "SUSPENDIDO" : "ACTIVO"}
                      </span>
                    </p>
                  </div>
                  <label className="text-xs text-[var(--muted)]">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                    Selección
                  </label>
                </div>
                <div className="mt-3">
                  <EntityActionMenu
                    title="Acciones de usuario"
                    actions={[
                      {
                        id: `edit-${user.id}`,
                        label: "Editar",
                        kind: "edit",
                        run: () => {
                          setPendingRenameUserId(user.id);
                          setRenameValue(user.name);
                        },
                      },
                      {
                        id: `suspend-${user.id}`,
                        label: suspendedIds.includes(user.id) ? "Reactivar acceso" : "Suspender acceso",
                        kind: "state",
                        run: () =>
                          setSuspendedIds((prev) =>
                            prev.includes(user.id)
                              ? prev.filter((id) => id !== user.id)
                              : [...prev, user.id],
                          ),
                      },
                      {
                        id: `role-${user.id}`,
                        label: "Cambiar rol",
                        kind: "flow",
                        run: () => {
                          setPendingRoleUserId(user.id);
                          setRoleValue((user.role ?? "CLIENT") as Role);
                        },
                      },
                      {
                        id: `delete-${user.id}`,
                        label: "Quitar de la lista",
                        kind: "delete",
                        danger: true,
                        requiresConfirm: true,
                        run: () => setSoftDeletedIds((prev) => [...prev, user.id]),
                      },
                      {
                        id: `activity-${user.id}`,
                        label: "Ver actividad",
                        kind: "flow",
                        run: () => setActivityUserId(user.id),
                      },
                    ]}
                  />
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
              Aún no hay usuarios visibles. Crea uno nuevo con el formulario de la derecha.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4 text-[var(--secondary)]" />
          Política de acceso
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {role === "ADMIN"
            ? "Puedes asignar, revocar y auditar permisos."
            : "Tu rol opera con permisos mínimos necesarios."}
        </p>
        <form className="mt-4 space-y-2" onSubmit={onCreate}>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Nombre"
          />
          <input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Email"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Teléfono"
          />
          <Button type="submit" size="sm" className="w-full" loading={createUser.isPending}>
            Crear usuario
          </Button>
        </form>
        {editingUser ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Editando rápido: {editingUser.name}
          </p>
        ) : null}
      </Card>

      <OnboardingFlow />

      <div className="lg:col-span-3">
        <BulkActionBar
          selectedCount={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onDeactivateSelected={() => {
            setSuspendedIds((prev) => Array.from(new Set([...prev, ...selectedIds])));
            setSelectedIds([]);
          }}
          onDeleteSelected={() => {
            setPendingBulkDelete(true);
          }}
        />
      </div>

      {softDeletedIds.length ? (
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2 text-white">
            <ActivitySquare className="h-4 w-4 text-[var(--warning)]" />
            Ocultos
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {softDeletedIds.map((userId) => (
              <Button
                key={userId}
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSoftDeletedIds((prev) => prev.filter((currentId) => currentId !== userId))
                }
              >
                Restaurar {list.find((user) => user.id === userId)?.name ?? userId}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <Dialog open={Boolean(pendingRenameUserId)} onOpenChange={(open) => !open && setPendingRenameUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nombre</DialogTitle>
            <DialogDescription>Actualiza el nombre visible del usuario.</DialogDescription>
          </DialogHeader>
          <input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Nombre"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingRenameUserId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!pendingRenameUserId) return;
                await onQuickRename(pendingRenameUserId, renameValue);
                setPendingRenameUserId(null);
              }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingRoleUserId)} onOpenChange={(open) => !open && setPendingRoleUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol</DialogTitle>
            <DialogDescription>Selecciona el rol operativo del usuario.</DialogDescription>
          </DialogHeader>
          <Select value={roleValue} onValueChange={(value) => setRoleValue(value as Role)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="TRAINER">TRAINER</SelectItem>
              <SelectItem value="CLIENT">CLIENT</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingRoleUserId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!pendingRoleUserId) return;
                await updateUser.mutateAsync({
                  userId: pendingRoleUserId,
                  data: { bio: `Rol solicitado: ${roleValue}` },
                });
                setPendingRoleUserId(null);
              }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activityUserId)} onOpenChange={(open) => !open && setActivityUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actividad del usuario</DialogTitle>
            <DialogDescription>
              Resumen de actividad disponible en perfil y analytics para{" "}
              {list.find((user) => user.id === activityUserId)?.name ?? "usuario"}.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingBulkDelete} onOpenChange={setPendingBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar selección</AlertDialogTitle>
            <AlertDialogDescription>
              Se retirarán del listado {selectedIds.length} usuarios seleccionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSoftDeletedIds((prev) => Array.from(new Set([...prev, ...selectedIds])));
                setSelectedIds([]);
                setPendingBulkDelete(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
