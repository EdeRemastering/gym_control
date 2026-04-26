"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMembership,
  useCreatePayment,
} from "@/hooks/use-zudel-mutations";
import { usePlans, useUsers } from "@/hooks/use-zudel-query";

const paymentMembershipSchema = z.object({
  userId: z.string().min(1, "Selecciona un usuario"),
  planId: z.string().min(1, "Selecciona un plan"),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  method: z.enum(["CASH", "CARD", "TRANSFER", "ONLINE"]),
});

type PaymentMembershipForm = z.infer<typeof paymentMembershipSchema>;

export function PaymentMembershipFlow() {
  const users = useUsers();
  const plans = usePlans();
  const createMembership = useCreateMembership();
  const createPayment = useCreatePayment();
  const form = useForm<PaymentMembershipForm>({
    resolver: zodResolver(paymentMembershipSchema),
    mode: "onChange",
    defaultValues: {
      userId: "",
      planId: "",
      amount: 0,
      method: "CARD",
    },
  });

  const userId = form.watch("userId");
  const planId = form.watch("planId");
  const selectedPlan = useMemo(
    () => (plans.data ?? []).find((plan) => plan.id === planId),
    [planId, plans.data],
  );

  const submit = form.handleSubmit(async (data) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (selectedPlan?.duration ?? 30));

    const membership = await createMembership.mutateAsync({
      userId: data.userId,
      planId: data.planId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "ACTIVE",
    });

    await createPayment.mutateAsync({
      userId: data.userId,
      membershipId: membership.id,
      amount: data.amount,
      finalAmount: data.amount,
      method: data.method,
      status: "COMPLETED",
      notes: "Invoice virtual generada en flujo E2E",
    });
    form.reset({ userId: "", planId: "", amount: 0, method: "CARD" });
  });

  return (
    <Card className="border-white/10 bg-white/[0.04] p-4 shadow-inner shadow-black/20 ring-1 ring-white/5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Flujo membresía + pago</p>
      <form className="mt-3 grid gap-3 md:grid-cols-5" onSubmit={submit}>
        <FormField label="Usuario" htmlFor="payment-membership-user" error={form.formState.errors.userId?.message}>
          <Controller
            control={form.control}
            name="userId"
            render={({ field }) => (
              <Select value={field.value || "__none__"} onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}>
                <SelectTrigger id="payment-membership-user">
                  <SelectValue placeholder="Selecciona usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecciona usuario</SelectItem>
                  {(users.data ?? []).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Plan" htmlFor="payment-membership-plan" error={form.formState.errors.planId?.message}>
          <Controller
            control={form.control}
            name="planId"
            render={({ field }) => (
              <Select value={field.value || "__none__"} onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}>
                <SelectTrigger id="payment-membership-plan">
                  <SelectValue placeholder="Selecciona plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecciona plan</SelectItem>
                  {(plans.data ?? []).map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Monto" htmlFor="payment-membership-amount" error={form.formState.errors.amount?.message}>
          <FormInput
            id="payment-membership-amount"
            type="number"
            {...form.register("amount", { valueAsNumber: true })}
            placeholder="120000"
          />
        </FormField>
        <FormField label="Método" htmlFor="payment-membership-method" error={form.formState.errors.method?.message}>
          <Controller
            control={form.control}
            name="method"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="payment-membership-method">
                  <SelectValue placeholder="Selecciona método" />
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
        <Button
          type="submit"
          size="sm"
          disabled={createMembership.isPending || createPayment.isPending || form.formState.isSubmitting}
          loading={createMembership.isPending || createPayment.isPending || form.formState.isSubmitting}
        >
          {createMembership.isPending || createPayment.isPending || form.formState.isSubmitting
            ? "Ejecutando..."
            : "Ejecutar flujo"}
        </Button>
      </form>
    </Card>
  );
}
