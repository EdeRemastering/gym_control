"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("admin@gymcontrol.app");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.login({ email, password });
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
        role: "ADMIN",
      });
      router.push("/");
    } catch {
      setError("No se pudo iniciar sesión. Verifica credenciales.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Gym Control
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Acceso a la plataforma</h1>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-white/5 p-3 text-sm text-white outline-none focus:border-[var(--primary)]"
            placeholder="Correo"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-[var(--border)] bg-white/5 p-3 text-sm text-white outline-none focus:border-[var(--primary)]"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" className="w-full" loading={loading}>
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
