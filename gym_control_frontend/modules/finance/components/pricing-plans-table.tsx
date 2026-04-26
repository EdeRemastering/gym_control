"use client";

import { Pencil } from "lucide-react";
import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveDataView } from "@/components/responsive-data-view";

export function PricingPlansTable({ plans, onEdit }: { plans: Plan[]; onEdit?: (plan: Plan) => void }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Planes activos</p>
      <ResponsiveDataView
        className="mt-3"
        mobile={
          plans.length ? (
            <div className="space-y-2">
              {plans.map((plan) => (
                <article key={`mobile-plan-${plan.id}`} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/90">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{plan.name}</p>
                    {onEdit ? (
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => onEdit(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <p><span className="text-[var(--muted)]">Precio:</span> ${Number(plan.price).toLocaleString()}</p>
                    <p><span className="text-[var(--muted)]">Duración:</span> {plan.duration} días</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-black/20 p-4 text-center text-[var(--muted)]">
              No hay planes. Crea uno desde el panel.
            </div>
          )
        }
        desktop={
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-2 font-medium">Plan</th>
                  <th className="pb-2 pr-2 font-medium">Precio</th>
                  <th className="pb-2 pr-2 font-medium">Duración (días)</th>
                  {onEdit ? <th className="w-10 pb-2" /> : null}
                </tr>
              </thead>
              <tbody className="text-white/90">
                {plans.length ? (
                  plans.map((plan) => (
                    <tr key={plan.id} className="border-t border-white/10">
                      <td className="py-2 pr-2 font-medium">{plan.name}</td>
                      <td className="py-2 pr-2">${Number(plan.price).toLocaleString()}</td>
                      <td className="py-2 pr-2">{plan.duration}</td>
                      {onEdit ? (
                        <td className="py-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(plan)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={onEdit ? 4 : 3} className="py-6 text-center text-[var(--muted)]">
                      No hay planes. Crea uno desde el panel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
      />
    </Card>
  );
}
