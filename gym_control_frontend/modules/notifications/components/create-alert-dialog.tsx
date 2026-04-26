"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormInput, FormTextarea } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAlertSchema, type CreateAlertFormData } from "@/modules/notifications/schemas/alert.schema";

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAlertFormData) => Promise<void> | void;
}

export function CreateAlertDialog({ open, onOpenChange, onSubmit }: CreateAlertDialogProps) {
  const form = useForm<CreateAlertFormData>({
    resolver: zodResolver(createAlertSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      message: "",
      priority: "important",
      scope: "reminder",
      owner: "",
      branch: "",
    },
  });

  const submit = form.handleSubmit(async (data) => {
    await Promise.resolve(onSubmit(data));
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear alerta</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <FormField label="Título" htmlFor="create-alert-title" error={form.formState.errors.title?.message}>
            <FormInput id="create-alert-title" {...form.register("title")} placeholder="Ej: Membresías que vencen mañana" />
          </FormField>
          <FormField label="Mensaje" htmlFor="create-alert-message" error={form.formState.errors.message?.message}>
            <FormTextarea
              id="create-alert-message"
              {...form.register("message")}
              placeholder="Ej: Contactar a los clientes con plan mensual antes de las 6:00 p. m."
              rows={3}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Responsable" htmlFor="create-alert-owner" error={form.formState.errors.owner?.message}>
              <FormInput id="create-alert-owner" {...form.register("owner")} placeholder="Ej: Coordinador operativo" />
            </FormField>
            <FormField label="Sede" htmlFor="create-alert-branch" error={form.formState.errors.branch?.message}>
              <FormInput id="create-alert-branch" {...form.register("branch")} placeholder="Ej: Sede Norte" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Prioridad" htmlFor="create-alert-priority" error={form.formState.errors.priority?.message}>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="create-alert-priority">
                      <SelectValue placeholder="Selecciona una prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="important">Importante</SelectItem>
                      <SelectItem value="informative">Informativa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Tipo de alerta" htmlFor="create-alert-scope" error={form.formState.errors.scope?.message}>
              <Controller
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="create-alert-scope">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Pago</SelectItem>
                      <SelectItem value="attendance">Asistencia</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="training">Entrenamiento</SelectItem>
                      <SelectItem value="reminder">Recordatorio</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <Button type="submit" size="sm" variant="primary" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creando..." : "Guardar alerta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
