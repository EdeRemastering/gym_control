"use client";

import { Dispatch, SetStateAction } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PendingRemovePost = { id: string } | null;

type SocialModuleDialogsProps = {
  pendingRemovePost: PendingRemovePost;
  setPendingRemovePostId: Dispatch<SetStateAction<string | null>>;
  setHiddenPosts: Dispatch<SetStateAction<string[]>>;
  editingPostId: string | null;
  setEditingPostId: Dispatch<SetStateAction<string | null>>;
  editingValue: string;
  setEditingValue: Dispatch<SetStateAction<string>>;
  setEditedContentByPost: Dispatch<SetStateAction<Record<string, string>>>;
};

export function SocialModuleDialogs({
  pendingRemovePost,
  setPendingRemovePostId,
  setHiddenPosts,
  editingPostId,
  setEditingPostId,
  editingValue,
  setEditingValue,
  setEditedContentByPost,
}: SocialModuleDialogsProps) {
  return (
    <>
      <AlertDialog
        open={Boolean(pendingRemovePost)}
        onOpenChange={(open) => {
          if (!open) setPendingRemovePostId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ocultar publicación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta publicación dejará de verse en la comunidad. Podrás restaurarla desde el panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingRemovePost) return;
                setHiddenPosts((prev) => [...prev, pendingRemovePost.id]);
                setPendingRemovePostId(null);
              }}
            >
              Ocultar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(editingPostId)} onOpenChange={(open) => !open && setEditingPostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar publicación</DialogTitle>
            <DialogDescription>Actualiza el contenido del mensaje antes de guardarlo.</DialogDescription>
          </DialogHeader>
          <textarea
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Escribe el nuevo texto de la publicación"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingPostId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editingPostId || !editingValue.trim()) return;
                setEditedContentByPost((prev) => ({ ...prev, [editingPostId]: editingValue.trim() }));
                setEditingPostId(null);
              }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

