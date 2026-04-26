"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EditableProfile } from "@/modules/profile/actions/profile.interactions";

type Props = {
  profile: EditableProfile;
  onEdit: () => void;
};

export function ProfilePrivacyCard({ profile, onEdit }: Props) {
  return (
    <Card className="relative border-[var(--border)] bg-[linear-gradient(180deg,rgba(14,24,37,0.96),rgba(8,14,26,0.97))] lg:col-span-4 lg:min-h-[252px] xl:min-h-[262px]">
      <span className="absolute left-0 top-5 h-16 w-[2px] rounded-full bg-cyan-300/90" />
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-cyan-300" />
        <p className="text-sm font-medium text-white">Privacidad</p>
      </div>
      <div className="mt-3 space-y-2 text-sm text-white">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <span>Entrenamiento</span>
          <span className={profile.publishTrainingRoutines ? "text-emerald-300" : "text-[var(--muted)]"}>
            {profile.publishTrainingRoutines ? "Público" : "Privado"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <span>Nutrición</span>
          <span className={profile.publishNutritionRoutines ? "text-emerald-300" : "text-[var(--muted)]"}>
            {profile.publishNutritionRoutines ? "Público" : "Privado"}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={onEdit}>
          Editar privacidad
        </Button>
        <p className="pt-1 text-xs text-[var(--muted)]">Tú decides quién puede ver tu información</p>
      </div>
    </Card>
  );
}
