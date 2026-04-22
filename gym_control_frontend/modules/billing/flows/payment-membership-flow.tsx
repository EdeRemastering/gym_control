"use client";

import { FormEvent, useMemo, useState } from "react";
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
} from "@/hooks/use-gym-mutations";
import { usePlans, useUsers } from "@/hooks/use-gym-query";

export function PaymentMembershipFlow() {
  const users = useUsers();
  const plans = usePlans();
  const createMembership = useCreateMembership();
  const createPayment = useCreatePayment();
  const [form, setForm] = useState({
    userId: "",
    planId: "",
    amount: "0",
    method: "CARD" as "CASH" | "CARD" | "TRANSFER" | "ONLINE",
  });

  const selectedPlan = useMemo(
    () => (plans.data ?? []).find((plan) => plan.id === form.planId),
    [form.planId, plans.data],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.userId || !form.planId) return;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (selectedPlan?.duration ?? 30));

    const membership = await createMembership.mutateAsync({
      userId: form.userId,
      planId: form.planId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "ACTIVE",
    });

    await createPayment.mutateAsync({
      userId: form.userId,
      membershipId: membership.id,
      amount: Number(form.amount),
      finalAmount: Number(form.amount),
      method: form.method,
      status: "COMPLETED",
      notes: "Invoice virtual generada en flujo E2E",
    });
  }

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Payment → Membership Flow</p>
      <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={onSubmit}>
        <Select
          value={form.userId || "__none__"}
          onValueChange={(value) => setForm((prev) => ({ ...prev, userId: value === "__none__" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Usuario</SelectItem>
            {(users.data ?? []).map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={form.planId || "__none__"}
          onValueChange={(value) => setForm((prev) => ({ ...prev, planId: value === "__none__" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Plan</SelectItem>
            {(plans.data ?? []).map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          value={form.amount}
          onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Monto"
        />
        <Button
          type="submit"
          size="sm"
          loading={createMembership.isPending || createPayment.isPending}
        >
          Ejecutar flujo
        </Button>
      </form>
    </Card>
  );
}
