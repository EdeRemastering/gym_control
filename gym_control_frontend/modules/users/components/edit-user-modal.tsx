"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserListItem } from "@/modules/users/types/users-management.types";

interface EditUserModalProps {
  user: UserListItem | null;
  onClose: () => void;
  onSave: (data: { userId: string; name: string }) => Promise<void>;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [draftName, setDraftName] = useState<string | null>(null);
  const currentName = draftName ?? user?.name ?? "";
  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open) {
          setDraftName(null);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader><DialogTitle>Editar usuario</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <input value={currentName} onChange={(event) => setDraftName(event.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white" />
          <Button
            className="w-full"
            onClick={async () => {
              if (!user) return;
              await onSave({ userId: user.id, name: currentName });
              setDraftName(null);
              onClose();
            }}
          >
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
