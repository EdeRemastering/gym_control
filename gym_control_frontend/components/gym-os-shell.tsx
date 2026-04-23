"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Command, Plus, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsModule } from "@/modules/analytics/components/analytics-module";
import { BillingModule } from "@/modules/billing/components/billing-module";
import { DashboardModule } from "@/modules/dashboard/components/dashboard-module";
import { SchedulingModule } from "@/modules/scheduling/components/scheduling-module";
import { TrainingModule } from "@/modules/training/components/training-module";
import { UsersModule } from "@/modules/users/components/users-module";
import { ProfileModule } from "@/modules/profile/components/profile-module";
import { SocialModule } from "@/modules/social/components/social-module";
import { NotificationsModule } from "@/modules/notifications/components/notifications-module";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/types";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useSessionStore } from "@/lib/session-store";
import { moduleLabels, roleModules, type ModuleKey } from "@/lib/navigation";
import { useProfileNavStore } from "@/lib/profile-nav-store";

export function GymControlShell() {
  const router = useRouter();
  const role = useSessionStore((state) => state.role);
  const user = useSessionStore((state) => state.user);
  const setRole = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const prevModuleRef = useRef<ModuleKey>(activeModule);

  const allowedModules = useMemo(() => roleModules[role], [role]);
  const requestProfileFocus = useProfileNavStore((state) => state.requestProfileFocus);
  const clearProfileFocus = useProfileNavStore((state) => state.clearProfileFocus);

  const CurrentModule = {
    dashboard: DashboardModule,
    billing: BillingModule,
    training: TrainingModule,
    scheduling: SchedulingModule,
    users: UsersModule,
    analytics: AnalyticsModule,
    profile: ProfileModule,
    social: SocialModule,
    notifications: NotificationsModule,
  }[activeModule];

  const quickActions = [
    { label: "Crear clase", module: "scheduling" as ModuleKey },
    { label: "Registrar pago", module: "billing" as ModuleKey },
    { label: "Iniciar sesión de entrenamiento", module: "training" as ModuleKey },
    { label: "Añadir cliente", module: "users" as ModuleKey },
    { label: "Publicar en feed", module: "social" as ModuleKey },
    { label: "Ver notificaciones", module: "notifications" as ModuleKey },
  ];

  const quickNav = [
    "dashboard",
    "social",
    "training",
    "notifications",
    "profile",
  ] as ModuleKey[];

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(commandQuery.toLowerCase()),
  );

  function runAction(module: ModuleKey) {
    setActiveModule(module);
    setCommandOpen(false);
    setQuickOpen(false);
  }

  const onOpenMemberProfile = useCallback(
    (userId: string) => {
      requestProfileFocus(userId);
      if (allowedModules.includes("profile")) {
        setActiveModule("profile");
      }
    },
    [allowedModules, requestProfileFocus],
  );

  const moduleShellProps: ModuleShellProps = useMemo(
    () => ({ role, onOpenMemberProfile }),
    [role, onOpenMemberProfile],
  );

  useEffect(() => {
    if (prevModuleRef.current === "profile" && activeModule !== "profile") {
      clearProfileFocus();
    }
    prevModuleRef.current = activeModule;
  }, [activeModule, clearProfileFocus]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setQuickOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 p-3 pb-24 md:p-5 md:pb-6 xl:p-6">
      <section className="flex min-h-[92vh] flex-1 flex-col gap-3 md:gap-4">
        <Card className="sticky top-4 z-30 flex items-center justify-between rounded-2xl bg-[var(--surface)]/80 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Gym Control</p>
            <h1 className="text-xl font-semibold text-white">{moduleLabels[activeModule]}</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Paso recomendado: usa una acción rápida para empezar en menos clics.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCommandOpen((prev) => !prev)}
            >
              <Search className="h-4 w-4" />
              Buscar
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Ctrl + K</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setQuickOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Acción rápida
            </Button>
          </div>
        </Card>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {(["ADMIN", "TRAINER", "CLIENT"] as Role[]).map((currentRole) => (
            <Button
              key={currentRole}
              variant={role === currentRole ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                if (!user) return;
                setRole({
                  accessToken: useSessionStore.getState().accessToken ?? "",
                  refreshToken: useSessionStore.getState().refreshToken ?? "",
                  user,
                  role: currentRole,
                });
                setActiveModule(roleModules[currentRole][0]);
              }}
            >
              {currentRole}
            </Button>
          ))}
        </div>

        <div className="hidden flex-wrap gap-2 lg:flex">
          {allowedModules.map((moduleKey) => (
            <Button
              key={moduleKey}
              variant={moduleKey === activeModule ? "secondary" : "ghost"}
              onClick={() => setActiveModule(moduleKey)}
            >
              {moduleLabels[moduleKey]}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${activeModule}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <CurrentModule {...moduleShellProps} />
          </motion.div>
        </AnimatePresence>
      </section>

      <aside className="hidden w-80 flex-col gap-4 xl:flex">
        <Card className="sticky top-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Acciones rápidas</p>
          <p className="text-xs text-[var(--muted)]">Elige una para continuar sin navegar por menús.</p>
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex w-full items-center gap-2 rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-[var(--border)] hover:bg-white/10"
              onClick={() => runAction(action.module)}
            >
              <Command className="h-4 w-4 text-[var(--primary)]" />
              {action.label}
            </button>
          ))}
          <Button
            variant="ghost"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            Cerrar sesión
          </Button>
        </Card>
      </aside>

      {commandOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-6 pt-24 backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <Card className="w-full max-w-2xl">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-sm text-white">Buscador rápido</p>
              <p className="text-xs text-[var(--muted)]">
                Escribe lo que quieres hacer y presiona Enter.
              </p>
              <input
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredActions.length > 0) {
                    event.preventDefault();
                    runAction(filteredActions[0].module);
                  }
                  if (event.key === "Escape") {
                    setCommandOpen(false);
                  }
                }}
                placeholder="Buscar acción..."
                className="mt-3 w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white outline-none"
              />
              <div className="mt-3 grid gap-2">
                {filteredActions.map((action) => (
                  <button
                    key={`cmd-${action.label}`}
                    className="rounded-lg border border-[var(--border)] bg-white/5 p-2 text-left text-sm text-white hover:bg-white/10"
                    onClick={() => runAction(action.module)}
                  >
                    {action.label}
                  </button>
                ))}
                {filteredActions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                    No encontramos acciones con ese texto. Prueba con pago, entrenamiento o usuario.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 backdrop-blur md:hidden">
        {quickNav.map((moduleKey) => (
          <button
            key={`mobile-nav-${moduleKey}`}
            className={`rounded-xl px-3 py-2 text-xs ${
              activeModule === moduleKey ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
            }`}
            onClick={() => setActiveModule(moduleKey)}
          >
            {moduleLabels[moduleKey].split(" ")[0]}
          </button>
        ))}
      </div>

      <button
        className="fixed bottom-24 right-4 z-40 rounded-full bg-[var(--primary)] p-3 text-white shadow-lg md:hidden"
        onClick={() => setQuickOpen((prev) => !prev)}
      >
        <Plus className="h-5 w-5" />
      </button>

      {quickOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 p-4 md:hidden" onClick={() => setQuickOpen(false)}>
          <Card className="mx-auto mt-24 max-w-sm space-y-2">
            <p className="text-xs text-[var(--muted)]">Selecciona una acción para continuar.</p>
            {quickActions.map((action) => (
              <button
                key={`fab-${action.label}`}
                className="w-full rounded-lg bg-white/5 p-2 text-left text-sm text-white"
                onClick={() => runAction(action.module)}
              >
                {action.label}
              </button>
            ))}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
