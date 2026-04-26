"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateUser } from "@/hooks/use-zudel-mutations";

const onboardingSchema = z.object({
  name: z.string().min(3, "Nombre requerido"),
  email: z.string().email("Correo inválido").or(z.literal("")),
  phone: z.string().min(8, "Teléfono inválido").or(z.literal("")),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export function OnboardingFlow() {
  const createUser = useCreateUser();
  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", phone: "" },
  });

  const submit = form.handleSubmit(async (data) => {
    await createUser.mutateAsync({
      name: data.name.trim(),
      email: data.email || undefined,
      phone: data.phone || undefined,
      bio: "Usuario onboarding Zudel OS",
    });
    form.reset({ name: "", email: "", phone: "" });
  });

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Onboarding Flow</p>
      <form className="mt-3 space-y-2" onSubmit={submit}>
        <FormField label="Nombre del usuario" htmlFor="onboarding-name" error={form.formState.errors.name?.message}>
          <FormInput id="onboarding-name" {...form.register("name")} placeholder="Ej: Mateo Ruiz" />
        </FormField>
        <FormField label="Correo electrónico" htmlFor="onboarding-email" error={form.formState.errors.email?.message}>
          <FormInput id="onboarding-email" {...form.register("email")} placeholder="usuario@gymcontrol.app" />
        </FormField>
        <FormField label="Teléfono" htmlFor="onboarding-phone" error={form.formState.errors.phone?.message}>
          <FormInput id="onboarding-phone" {...form.register("phone")} placeholder="+57 300 123 4567" />
        </FormField>
        <Button
          type="submit"
          size="sm"
          className="w-full"
          loading={createUser.isPending || form.formState.isSubmitting}
          disabled={createUser.isPending || form.formState.isSubmitting}
        >
          {createUser.isPending || form.formState.isSubmitting ? "Creando..." : "Crear usuario y activar acceso"}
        </Button>
      </form>
    </Card>
  );
}
