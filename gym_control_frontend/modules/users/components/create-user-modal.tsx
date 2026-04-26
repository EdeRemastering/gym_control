"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { FormInput } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserForm } from "@/modules/users/hooks/use-user-forms";
import type { CreateUserForm } from "@/modules/users/schemas/users-management.schema";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserForm) => Promise<void>;
}

export function CreateUserModal({ open, onOpenChange, onSubmit }: CreateUserModalProps) {
  const form = useCreateUserForm();
  const submit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar cliente</DialogTitle></DialogHeader>
        <form className="space-y-2" onSubmit={submit}>
          <FormField label="Nombre completo" htmlFor="create-user-name" error={form.formState.errors.name?.message}>
            <FormInput id="create-user-name" {...form.register("name")} placeholder="Ej: Laura Ramírez" />
          </FormField>
          <FormField label="Correo electrónico" htmlFor="create-user-email" error={form.formState.errors.email?.message}>
            <FormInput id="create-user-email" {...form.register("email")} placeholder="Ej: laura@gymcontrol.app" />
          </FormField>
          <FormField label="Teléfono" htmlFor="create-user-phone" error={form.formState.errors.phone?.message}>
            <FormInput id="create-user-phone" {...form.register("phone")} placeholder="Ej: 3001234567" />
          </FormField>
          <FormField label="Sede" htmlFor="create-user-branch" error={form.formState.errors.branch?.message}>
            <FormInput id="create-user-branch" {...form.register("branch")} placeholder="Ej: Sede Centro" />
          </FormField>
          <FormField label="Perfil de acceso" htmlFor="create-user-role" error={form.formState.errors.role?.message}>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="create-user-role">
                    <SelectValue placeholder="Selecciona un perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="TRAINER">Entrenador</SelectItem>
                    <SelectItem value="CLIENT">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Registrar cliente"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
