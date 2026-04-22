"use client";

import { FormEvent, useState } from "react";
import { CreditCard, Funnel, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePayments, usePlans, useRevenue, useUsers } from "@/hooks/use-gym-query";
import { useCreatePayment, useCreatePlan } from "@/hooks/use-gym-mutations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/types";
import { PaymentMembershipFlow } from "@/modules/billing/flows/payment-membership-flow";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import { toast } from "sonner";

export function BillingModule({ role }: { role: Role }) {
  const revenue = useRevenue();
  const plans = usePlans();
  const payments = usePayments();
  const users = useUsers();
  const createPlan = useCreatePlan();
  const createPayment = useCreatePayment();
  const [planForm, setPlanForm] = useState({ name: "", duration: "30", price: "0" });
  const [paymentForm, setPaymentForm] = useState({
    userId: "",
    amount: "0",
    method: "CARD" as "CASH" | "CARD" | "TRANSFER" | "ONLINE",
  });
  const [cancelledPayments, setCancelledPayments] = useState<string[]>([]);
  const points = revenue.data ?? [];

  async function onCreatePlan(event: FormEvent) {
    event.preventDefault();
    await createPlan.mutateAsync({
      name: planForm.name,
      duration: Number(planForm.duration),
      price: Number(planForm.price),
    });
    setPlanForm({ name: "", duration: "30", price: "0" });
  }

  async function onCreatePayment(event: FormEvent) {
    event.preventDefault();
    if (!paymentForm.userId) return;
    const amount = Number(paymentForm.amount);
    await createPayment.mutateAsync({
      userId: paymentForm.userId,
      amount,
      finalAmount: amount,
      method: paymentForm.method,
      status: "COMPLETED",
    });
    setPaymentForm((prev) => ({ ...prev, amount: "0" }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <p className="text-sm text-[var(--muted)]">Flujo de ingresos (Stripe-like)</p>
        <div className="mt-4 flex items-end gap-2">
          {points.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-[var(--primary)]/70"
                style={{ height: `${Math.max(24, point.value / 10)}px` }}
              />
              <span className="text-xs text-[var(--muted)]">{point.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Wallet className="h-4 w-4 text-[var(--secondary)]" />
          MRR activo
        </div>
        <p className="text-3xl font-semibold text-white">$18,420</p>
        <p className="text-xs text-[var(--muted)]">+8.4% vs semana anterior</p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white">
          <Funnel className="h-4 w-4 text-[var(--warning)]" />
          Embudo de membresías
        </div>
        <div className="mt-3 space-y-2 text-sm text-white">
          <p>Trial: 27</p>
          <p>Conversión: 64%</p>
          <p>Churn: 3.9%</p>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <CreditCard className="h-4 w-4 text-[var(--primary)]" />
          Timeline de transacciones
        </div>
        <div className="mt-3 space-y-2">
          {["Pago anual Enterprise", "Cobro mensual Premium", "Reintento exitoso"].map(
            (transaction) => (
              <div key={transaction} className="rounded-xl bg-white/5 p-3 text-sm text-white">
                {transaction}
              </div>
            ),
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Permisos</p>
        <p className="mt-3 text-sm text-white">
          {role === "ADMIN"
            ? "Puede ejecutar reembolsos y ajustes de facturación."
            : "Vista restringida para lectura de pagos personales."}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Crear plan</p>
        <form className="mt-3 space-y-2" onSubmit={onCreatePlan}>
          <input
            value={planForm.name}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Nombre plan"
          />
          <input
            value={planForm.duration}
            onChange={(event) =>
              setPlanForm((prev) => ({ ...prev, duration: event.target.value }))
            }
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Duración (días)"
          />
          <input
            value={planForm.price}
            onChange={(event) => setPlanForm((prev) => ({ ...prev, price: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Precio"
          />
          <Button type="submit" size="sm" className="w-full" loading={createPlan.isPending}>
            Guardar plan
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <p className="text-sm text-[var(--muted)]">Registrar pago real</p>
        <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={onCreatePayment}>
          <Select
            value={paymentForm.userId || "__none__"}
            onValueChange={(value) =>
              setPaymentForm((prev) => ({ ...prev, userId: value === "__none__" ? "" : value }))
            }
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
          <input
            value={paymentForm.amount}
            onChange={(event) =>
              setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))
            }
            className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Monto"
          />
          <Select
            value={paymentForm.method}
            onValueChange={(value) =>
              setPaymentForm((prev) => ({
                ...prev,
                method: value as "CASH" | "CARD" | "TRANSFER" | "ONLINE",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CARD">CARD</SelectItem>
              <SelectItem value="CASH">CASH</SelectItem>
              <SelectItem value="TRANSFER">TRANSFER</SelectItem>
              <SelectItem value="ONLINE">ONLINE</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" loading={createPayment.isPending}>
            Crear pago
          </Button>
        </form>
        <div className="mt-3 space-y-2">
          {(payments.data ?? [])
            .filter((payment) => !cancelledPayments.includes(payment.id))
            .slice(0, 5)
            .map((payment) => (
              <div key={payment.id} className="rounded-xl bg-white/5 p-2 text-xs text-white">
                <p className="flex items-center gap-2">
                  <span>{payment.method}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      payment.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : payment.status === "FAILED"
                          ? "bg-red-500/20 text-red-200"
                          : payment.status === "PENDING"
                            ? "bg-indigo-500/20 text-indigo-200"
                            : "bg-gray-500/20 text-gray-200"
                    }`}
                  >
                    {payment.status}
                  </span>
                  <span>${Number(payment.finalAmount).toLocaleString()}</span>
                </p>
                <div className="mt-2">
                  <EntityActionMenu
                    title="Pagos"
                    actions={[
                      {
                        id: `retry-${payment.id}`,
                        label: "Reintentar",
                        kind: "flow",
                        run: () =>
                          createPayment.mutate({
                            userId: payment.userId,
                            amount: Number(payment.finalAmount),
                            finalAmount: Number(payment.finalAmount),
                            method: "CARD",
                            status: "COMPLETED",
                          }),
                      },
                      {
                        id: `fail-${payment.id}`,
                        label: "Marcar fallido",
                        kind: "state",
                        run: () => toast.error(`Pago ${payment.id} marcado como fallido`),
                      },
                      {
                        id: `refund-${payment.id}`,
                        label: "Reembolsar",
                        kind: "flow",
                        run: () => toast.success(`Reembolso iniciado para ${payment.id}`),
                      },
                      {
                        id: `cancel-${payment.id}`,
                        label: "Cancelar",
                        kind: "delete",
                        danger: true,
                        requiresConfirm: true,
                        run: () => setCancelledPayments((prev) => [...prev, payment.id]),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Planes activos: {(plans.data ?? []).length}
        </p>
      </Card>

      <div className="lg:col-span-3">
        <PaymentMembershipFlow />
      </div>
    </div>
  );
}
