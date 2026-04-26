"use client";

import { FormInput, FormTextarea } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateRoleForm } from "@/modules/users/hooks/use-user-forms";
import type { CreateRoleForm } from "@/modules/users/schemas/users-management.schema";

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoleForm) => Promise<void> | void;
}

export function CreateRoleModal({ open, onOpenChange, onSubmit }: CreateRoleModalProps) {
  const form = useCreateRoleForm();
  const submit = form.handleSubmit(async (data) => {
    await Promise.resolve(onSubmit(data));
    form.reset();
    onOpenChange(false);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear perfil de acceso</DialogTitle></DialogHeader>
        <form className="space-y-2" onSubmit={submit}>
          <FormField label="Nombre del perfil" htmlFor="create-role-name" error={form.formState.errors.name?.message}>
            <FormInput id="create-role-name" {...form.register("name")} placeholder="Ej: Coordinador de sede" />
          </FormField>
          <FormField
            label="Descripción"
            htmlFor="create-role-description"
            error={form.formState.errors.description?.message}
          >
            <FormTextarea
              id="create-role-description"
              {...form.register("description")}
              placeholder="Ej: Gestiona la operación diaria y supervisa el equipo."
              rows={3}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar perfil"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
