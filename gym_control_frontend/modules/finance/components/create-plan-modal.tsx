"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createPlanSchema, type CreatePlanForm } from "@/modules/finance/schemas/finance.schemas";

interface CreatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePlanForm) => Promise<void>;
  isPending: boolean;
}

export function CreatePlanModal({ open, onOpenChange, onSubmit, isPending }: CreatePlanModalProps) {
  const form = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    mode: "onChange",
    defaultValues: { name: "", duration: 30, price: 0 },
  });

  const submit = form.handleSubmit(async (data) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear plan de membresía</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={submit}>
          <FormField label="Nombre del plan" htmlFor="create-plan-name" error={form.formState.errors.name?.message}>
            <FormInput id="create-plan-name" {...form.register("name")} placeholder="Ej: Plan trimestral premium" />
          </FormField>
          <FormField
            label="Duración (días)"
            htmlFor="create-plan-duration"
            error={form.formState.errors.duration?.message}
          >
            <FormInput
              id="create-plan-duration"
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              placeholder="Ej: 90"
            />
          </FormField>
          <FormField label="Precio" htmlFor="create-plan-price" error={form.formState.errors.price?.message}>
            <FormInput
              id="create-plan-price"
              type="number"
              {...form.register("price", { valueAsNumber: true })}
              placeholder="Ej: 129900"
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isPending || form.formState.isSubmitting}>
            {isPending || form.formState.isSubmitting ? "Guardando..." : "Crear plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
