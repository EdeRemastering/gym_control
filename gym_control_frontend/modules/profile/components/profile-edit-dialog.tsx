"use client";

import type { Dispatch, SetStateAction } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cancelProfileDraft,
  readImageAsDataUrl,
  type EditableProfile,
} from "@/modules/profile/actions/profile.interactions";

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  draftProfile: EditableProfile;
  setDraftProfile: Dispatch<SetStateAction<EditableProfile>>;
  profile: EditableProfile;
  isSaving: boolean;
  onSaveDraft: (draft: EditableProfile) => Promise<void>;
};

export function ProfileEditDialog({
  open,
  onOpenChange,
  draftProfile,
  setDraftProfile,
  profile,
  isSaving,
  onSaveDraft,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Personaliza tu información visible y tu imagen de perfil.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Nombre</label>
            <input
              value={draftProfile.name}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Tu nombre visible"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Correo electrónico</label>
            <input
              value={draftProfile.email}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="usuario@gymcontrol.app"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">Biografía</label>
            <textarea
              value={draftProfile.bio}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, bio: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="Cuéntale a la comunidad tu objetivo"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--muted)]">URL de imagen de perfil</label>
            <input
              value={draftProfile.avatarUrl}
              onChange={(event) => setDraftProfile((prev) => ({ ...prev, avatarUrl: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Perfil dinámico · visibilidad</p>
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={draftProfile.publishTrainingRoutines}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    publishTrainingRoutines: event.target.checked,
                  }))
                }
              />
              Hacer pública mi rutina de entrenamiento
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={draftProfile.publishNutritionRoutines}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    publishNutritionRoutines: event.target.checked,
                  }))
                }
              />
              Hacer pública mi rutina de nutrición
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white">
            <Camera className="h-4 w-4 text-[var(--muted)]" />
            Subir imagen desde dispositivo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void readImageAsDataUrl(file).then((dataUrl) => {
                  setDraftProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));
                });
              }}
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => cancelProfileDraft(setDraftProfile, onOpenChange, profile)}>
            Cancelar
          </Button>
          <Button loading={isSaving} onClick={() => void onSaveDraft(draftProfile)}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
