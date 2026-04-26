"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Hash, ImageIcon, Send, Smile, Upload } from "lucide-react";
import { FormInput, FormTextarea } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readImageAsDataUrl } from "@/modules/profile/actions/profile.interactions";
import type { ProfilePostFormState } from "@/modules/profile/components/profile-dynamic.types";

const profilePublishSchema = z.object({
  content: z.string().min(3, "Escribe al menos 3 caracteres"),
  mediaUrl: z.string().optional().default(""),
  alsoShareInSocial: z.boolean(),
});

type ProfilePublishForm = z.infer<typeof profilePublishSchema>;

type Props = {
  initialForm: ProfilePostFormState;
  onSubmit: (data: ProfilePostFormState) => Promise<void> | void;
  isSubmitting: boolean;
};

export function ProfilePublishCard({ initialForm, onSubmit, isSubmitting }: Props) {
  const form = useForm<ProfilePublishForm>({
    resolver: zodResolver(profilePublishSchema),
    mode: "onChange",
    defaultValues: initialForm,
  });

  useEffect(() => {
    form.reset(initialForm);
  }, [form, initialForm]);

  const mediaUrl = form.watch("mediaUrl");

  const submit = form.handleSubmit(async (data) => {
    await Promise.resolve(onSubmit(data));
    form.reset({ content: "", mediaUrl: "", alsoShareInSocial: false });
  });

  return (
    <Card className="border-[var(--border)] bg-[linear-gradient(180deg,rgba(14,24,37,0.96),rgba(8,14,26,0.97))] lg:col-span-4 lg:min-h-[252px] xl:min-h-[262px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <p className="text-sm font-medium text-white">Publicar en mi perfil</p>
        <Select defaultValue="publico">
          <SelectTrigger className="h-8 w-28 border-cyan-300/20 bg-cyan-400/5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publico">Público</SelectItem>
            <SelectItem value="privado">Privado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <form className="mt-2.5 space-y-2" onSubmit={submit}>
        <div className="grid gap-2 md:grid-cols-[1fr_152px]">
          <div className="space-y-1.5">
            <FormField label="Contenido" htmlFor="profile-publish-content" error={form.formState.errors.content?.message}>
              <FormTextarea
                id="profile-publish-content"
                {...form.register("content")}
                className="min-h-[88px] border border-[var(--border)] bg-white/5 p-2.5 text-white"
                placeholder="Comparte tu avance personal, rutina o motivación..."
                rows={3}
              />
            </FormField>
            <div className="flex items-center gap-3 px-1 text-[var(--muted)]">
              <ImageIcon className="h-3.5 w-3.5" />
              <Smile className="h-3.5 w-3.5" />
              <Hash className="h-3.5 w-3.5" />
            </div>
            <FormField label="URL de imagen" htmlFor="profile-publish-media-url">
              <FormInput
                id="profile-publish-media-url"
                {...form.register("mediaUrl")}
                className="border border-[var(--border)] bg-white/5 p-2 text-xs text-white"
                placeholder="URL de imagen (opcional)"
              />
            </FormField>
          </div>
          <label className="flex min-h-[134px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-cyan-300/25 bg-cyan-400/5 p-2 text-xs text-white hover:bg-cyan-400/10">
            <Upload className="h-4 w-4 text-cyan-200" />
            <span className="font-medium">Subir imagen</span>
            <span className="text-[10px] text-[var(--muted)]">JPG, PNG (máx. 5MB)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void readImageAsDataUrl(file).then((dataUrl) => {
                  form.setValue("mediaUrl", dataUrl, { shouldDirty: true, shouldValidate: true });
                });
              }}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white">
          <input
            type="checkbox"
            checked={form.watch("alsoShareInSocial")}
            onChange={(event) => form.setValue("alsoShareInSocial", event.target.checked, { shouldDirty: true })}
          />
          También publicar en el Área social
        </label>
        {mediaUrl ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt="preview publicación" className="h-36 w-full object-cover" />
          </div>
        ) : null}
        <Button
          type="submit"
          size="sm"
          className="w-full border-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white hover:opacity-90"
          loading={isSubmitting || form.formState.isSubmitting}
          disabled={isSubmitting || form.formState.isSubmitting}
        >
          <Send className="h-4 w-4" />
          {isSubmitting || form.formState.isSubmitting ? "Publicando..." : "Publicar"}
        </Button>
      </form>
    </Card>
  );
}
