"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPermissionUxLabel } from "@/lib/permission-label.mapper";
import { useCreatePermissionForm } from "@/modules/users/hooks/use-user-forms";
import type { CreatePermissionForm } from "@/modules/users/schemas/users-management.schema";

const RESOURCE_OPTIONS = [
  { value: "user", label: "Usuarios" },
  { value: "role", label: "Roles" },
  { value: "permission", label: "Permisos" },
  { value: "payment", label: "Pagos" },
  { value: "class", label: "Clases" },
];

const ACTION_OPTIONS = [
  { value: "create", label: "Crear" },
  { value: "read", label: "Ver" },
  { value: "update", label: "Editar" },
  { value: "delete", label: "Eliminar" },
];

interface CreatePermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePermissionForm) => Promise<void> | void;
}

export function CreatePermissionModal({
  open,
  onOpenChange,
  onSubmit,
}: CreatePermissionModalProps) {
  const form = useCreatePermissionForm();

  const selectedResource = form.watch("resource");
  const selectedAction = form.watch("action");

  useEffect(() => {
    form.setValue("name", `${selectedResource}.${selectedAction}`, { shouldValidate: true });
  }, [form, selectedAction, selectedResource]);

  const submit = form.handleSubmit(async (data) => {
    await Promise.resolve(onSubmit(data));
    form.reset({ name: "user.read", resource: "user", action: "read", scope: "GYM" });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear permiso</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={submit}>
          <FormField label="Area" htmlFor="create-permission-resource" error={form.formState.errors.resource?.message}>
            <Controller
              control={form.control}
              name="resource"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="create-permission-resource">
                    <SelectValue placeholder="Selecciona area" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Accion permitida" htmlFor="create-permission-action" error={form.formState.errors.action?.message}>
            <Controller
              control={form.control}
              name="action"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="create-permission-action">
                    <SelectValue placeholder="Selecciona accion" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Alcance" htmlFor="create-permission-scope" error={form.formState.errors.scope?.message}>
            <Controller
              control={form.control}
              name="scope"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="create-permission-scope">
                    <SelectValue placeholder="Selecciona alcance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWN">Solo propio</SelectItem>
                    <SelectItem value="GYM">Toda la sede</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-[var(--muted)]">
            Se creara:{" "}
            <span className="font-medium text-white">{getPermissionUxLabel(selectedResource, selectedAction)}</span>
          </p>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar permiso"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
