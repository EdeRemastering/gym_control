"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  MoreHorizontal,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { EntityAction } from "@/modules/action-system/types";

interface EntityActionMenuProps<TPayload> {
  title?: string;
  actions: EntityAction<TPayload>[];
}

function getActionIcon(action: EntityAction) {
  const text = action.label.toLowerCase();
  if (action.kind === "delete") return Trash2;
  if (action.kind === "restore") return RefreshCcw;
  if (action.kind === "edit") return Edit3;
  if (action.kind === "state") return CheckCircle2;
  if (action.kind === "bulk") return Users2;
  if (text.includes("rol") || text.includes("permiso")) return ShieldAlert;
  return MoreHorizontal;
}

export function EntityActionMenu<TPayload>({ title = "Acciones", actions }: EntityActionMenuProps<TPayload>) {
  const [pendingConfirmActionId, setPendingConfirmActionId] = useState<string | null>(null);
  const [actionStateById, setActionStateById] = useState<
    Record<string, "idle" | "processing" | "success" | "error">
  >({});
  const pendingAction = actions.find((action) => action.id === pendingConfirmActionId) ?? null;

  async function executeAction(action: EntityAction<TPayload>) {
    setActionStateById((prev) => ({ ...prev, [action.id]: "processing" }));
    try {
      await action.run((action.payload ?? undefined) as TPayload);
      setActionStateById((prev) => ({ ...prev, [action.id]: "success" }));
      setTimeout(() => {
        setActionStateById((prev) => ({ ...prev, [action.id]: "idle" }));
      }, 1200);
    } catch {
      setActionStateById((prev) => ({ ...prev, [action.id]: "error" }));
      setTimeout(() => {
        setActionStateById((prev) => ({ ...prev, [action.id]: "idle" }));
      }, 1800);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/20 p-2">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        <MoreHorizontal className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = getActionIcon(action);
          const uiState = actionStateById[action.id] ?? "idle";
          return (
            <Button
              key={action.id}
              size="icon"
              variant={action.danger ? "destructive" : "secondary"}
              disabled={action.disabled || uiState === "processing"}
              title={action.label}
              aria-label={action.label}
              className={
                uiState === "processing"
                  ? "bg-blue-500/30 text-blue-200 ring-1 ring-blue-400"
                  : uiState === "success"
                    ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400"
                    : uiState === "error"
                      ? "bg-red-500/25 text-red-200 ring-1 ring-red-400"
                      : action.kind === "restore"
                        ? "bg-gray-500/20 text-gray-200"
                        : ""
              }
              onClick={() => {
                if (action.requiresConfirm) {
                  setPendingConfirmActionId(action.id);
                  return;
                }
                void executeAction(action);
              }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingConfirmActionId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres continuar con {pendingAction?.label}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingAction) return;
                void executeAction(pendingAction);
                setPendingConfirmActionId(null);
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
