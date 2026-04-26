"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormInput, FormTextarea } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insightDraftSchema, type InsightDraftForm } from "@/modules/insights/schemas/insight-draft.schema";
import { useInsightsActivityStore } from "@/modules/insights/store/use-insights-activity-store";
import { useInsightsUiStore } from "@/modules/insights/store/use-insights-ui-store";

export function CreateInsightDialog() {
  const open = useInsightsUiStore((s) => s.createInsightOpen);
  const setOpen = useInsightsUiStore((s) => s.setCreateInsightOpen);
  const prepend = useInsightsActivityStore((s) => s.prependOptimistic);
  const rid = useId().replace(/:/g, "");

  const form = useForm<InsightDraftForm>({
    resolver: zodResolver(insightDraftSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      detail: "",
      priority: "medium",
      owner: "",
    },
  });

  const submit = form.handleSubmit((data) => {
    const uuid = globalThis.crypto?.randomUUID?.();
    prepend({
      id: uuid ? `ins-${uuid}` : `ins-${rid}-${data.title}-${data.owner}-${data.priority}`,
      title: `Insight: ${data.title}`,
      subtitle: `${data.owner} · prioridad ${data.priority}`,
      variant: "info",
      at: new Date().toISOString(),
    });
    toast.success("Análisis guardado", { description: "Ya aparece en la actividad reciente." });
    form.reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border-white/10 bg-[linear-gradient(180deg,#0c1224,#070b14)]">
        <DialogHeader>
          <DialogTitle className="text-white">Nuevo análisis operativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <FormField label="Título" htmlFor="create-insight-title" error={form.formState.errors.title?.message}>
            <FormInput
              id="create-insight-title"
              {...form.register("title")}
              placeholder="Ej: Caída de asistencia en horario PM"
              className="border-white/10 bg-black/30 placeholder:text-white/35"
            />
          </FormField>
          <FormField label="Detalle" htmlFor="create-insight-detail" error={form.formState.errors.detail?.message}>
            <FormTextarea
              id="create-insight-detail"
              {...form.register("detail")}
              placeholder="Contexto, datos clave y acción recomendada"
              rows={4}
              className="border-white/10 bg-black/30 placeholder:text-white/35"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Responsable" htmlFor="create-insight-owner" error={form.formState.errors.owner?.message}>
              <FormInput
                id="create-insight-owner"
                {...form.register("owner")}
                placeholder="Ej: Líder de operaciones"
                className="border-white/10 bg-black/30 placeholder:text-white/35"
              />
            </FormField>
            <FormField label="Prioridad" htmlFor="create-insight-priority" error={form.formState.errors.priority?.message}>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="create-insight-priority" className="border-white/10 bg-black/30">
                      <SelectValue placeholder="Selecciona una prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="low">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar análisis"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
