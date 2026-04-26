"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "admin@gymcontrol.app",
      password: "123456",
    },
  });

  const submit = form.handleSubmit(async (data) => {
    try {
      const response = await api.auth.login({ email: data.email, password: data.password });
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
        role: "ADMIN",
      });
      router.push("/");
    } catch {
      form.setError("root", { message: "No se pudo iniciar sesión. Verifica credenciales." });
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Zudel OS</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Acceso a la plataforma</h1>
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <FormField label="Correo electrónico" htmlFor="login-email" error={form.formState.errors.email?.message}>
            <FormInput id="login-email" {...form.register("email")} placeholder="Ej: admin@gymcontrol.app" className="rounded-xl p-3" />
          </FormField>
          <FormField label="Contraseña" htmlFor="login-password" error={form.formState.errors.password?.message}>
            <FormInput
              id="login-password"
              type="password"
              {...form.register("password")}
              placeholder="Ingresa tu contraseña"
              className="rounded-xl p-3"
            />
          </FormField>
          {form.formState.errors.root?.message ? (
            <p className="text-sm text-[var(--danger)]">{form.formState.errors.root.message}</p>
          ) : null}
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting} disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Ingresando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

