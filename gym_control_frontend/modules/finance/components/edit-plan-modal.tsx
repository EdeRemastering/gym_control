"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { editPlanSchema, type EditPlanForm } from "@/modules/finance/schemas/finance.schemas";

interface EditPlanModalProps {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditPlanForm) => Promise<void> | void;
}

export function EditPlanModal({ plan, open, onOpenChange, onSubmit }: EditPlanModalProps) {
  const form = useForm<EditPlanForm>({
    resolver: zodResolver(editPlanSchema),
    mode: "onChange",
    values: plan
      ? { planId: plan.id, name: plan.name, duration: plan.duration, price: Number(plan.price) }
      : { planId: "", name: "", duration: 30, price: 0 },
  });

  const submit = form.handleSubmit(async (data) => {
    await Promise.resolve(onSubmit(data));
    onOpenChange(false);
  });

  return (
    <Dialog open={open && Boolean(plan)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar plan de membresía</DialogTitle>
        </DialogHeader>
        {plan ? (
          <form className="space-y-2" onSubmit={submit}>
            <input type="hidden" {...form.register("planId")} />
            <FormField label="Nombre del plan" htmlFor="edit-plan-name" error={form.formState.errors.name?.message}>
              <FormInput id="edit-plan-name" {...form.register("name")} placeholder="Ej: Plan mensual básico" />
            </FormField>
            <FormField label="Duración (días)" htmlFor="edit-plan-duration" error={form.formState.errors.duration?.message}>
              <FormInput id="edit-plan-duration" type="number" {...form.register("duration", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Precio" htmlFor="edit-plan-price" error={form.formState.errors.price?.message}>
              <FormInput id="edit-plan-price" type="number" {...form.register("price", { valueAsNumber: true })} />
            </FormField>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Actualizar plan"}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
