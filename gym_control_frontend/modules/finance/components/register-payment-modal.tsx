"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerPaymentSchema, type RegisterPaymentForm } from "@/modules/finance/schemas/finance.schemas";

interface RegisterPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onSubmit: (data: RegisterPaymentForm) => Promise<void>;
  isPending: boolean;
}

export function RegisterPaymentModal({
  open,
  onOpenChange,
  users,
  onSubmit,
  isPending,
}: RegisterPaymentModalProps) {
  const form = useForm<RegisterPaymentForm>({
    resolver: zodResolver(registerPaymentSchema),
    mode: "onChange",
    defaultValues: { userId: "", amount: 0, method: "CARD" },
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
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>
        <form className="space-y-2" onSubmit={submit}>
          <FormField label="Cliente" htmlFor="register-payment-user" error={form.formState.errors.userId?.message}>
            <Controller
              control={form.control}
              name="userId"
              render={({ field }) => (
                <Select
                  value={field.value ? field.value : "__none__"}
                  onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="register-payment-user">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Seleccionar cliente</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Monto" htmlFor="register-payment-amount" error={form.formState.errors.amount?.message}>
            <FormInput
              id="register-payment-amount"
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
              placeholder="Ej: 49900"
            />
          </FormField>
          <FormField label="Método de pago" htmlFor="register-payment-method" error={form.formState.errors.method?.message}>
            <Controller
              control={form.control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="register-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">Tarjeta</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isPending || form.formState.isSubmitting}>
            {isPending || form.formState.isSubmitting ? "Registrando..." : "Registrar pago"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
