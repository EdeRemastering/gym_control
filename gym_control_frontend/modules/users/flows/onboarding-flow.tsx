"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateUser } from "@/hooks/use-gym-mutations";

export function OnboardingFlow() {
  const createUser = useCreateUser();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createUser.mutateAsync({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      bio: "Usuario onboarding Gym Control",
    });
    setForm({ name: "", email: "", phone: "" });
  }

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Onboarding Flow</p>
      <form className="mt-3 space-y-2" onSubmit={onSubmit}>
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Nombre usuario"
        />
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Email"
        />
        <input
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          placeholder="Teléfono"
        />
        <Button type="submit" size="sm" className="w-full" loading={createUser.isPending}>
          Crear usuario y activar acceso
        </Button>
      </form>
    </Card>
  );
}
