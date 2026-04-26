"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarDays, ImageIcon, SendHorizontal, Trophy } from "lucide-react";
import { FormInput } from "@/components/forms/form-controls";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";

const socialComposerSchema = z.object({
  content: z.string().min(3, "Escribe al menos 3 caracteres para publicar"),
});

type SocialComposerForm = z.infer<typeof socialComposerSchema>;

type SocialModuleComposerProps = {
  socialView: "feed" | "explorar";
  onCreatePost: (content: string) => Promise<void>;
  initialPostContent: string;
  composerPostType: "publicaciones" | "logros" | "nutricion";
  setComposerPostType: (value: "publicaciones" | "logros" | "nutricion") => void;
  isCreatePending: boolean;
};

export function SocialModuleComposer({
  socialView,
  onCreatePost,
  initialPostContent,
  composerPostType,
  setComposerPostType,
  isCreatePending,
}: SocialModuleComposerProps) {
  const form = useForm<SocialComposerForm>({
    resolver: zodResolver(socialComposerSchema),
    mode: "onChange",
    defaultValues: {
      content: initialPostContent,
    },
  });

  useEffect(() => {
    form.setValue("content", initialPostContent, { shouldValidate: true });
  }, [form, initialPostContent]);

  const submit = form.handleSubmit(async (data) => {
    await onCreatePost(data.content);
    form.reset({ content: "" });
  });

  if (socialView !== "feed") return null;

  return (
    <form className="social-panel-form" onSubmit={submit}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-background">
          TU
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-sm font-medium text-foreground/90">Que entrenaste hoy?</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { key: "publicaciones", label: "General" },
              { key: "logros", label: "Logro" },
              { key: "nutricion", label: "Nutricion" },
            ].map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setComposerPostType(type.key as "publicaciones" | "logros" | "nutricion")}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  composerPostType === type.key
                    ? "border-secondary bg-secondary/20 text-secondary"
                    : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <FormField label="Contenido de la publicación" htmlFor="social-composer-content" error={form.formState.errors.content?.message}>
            <FormInput
              id="social-composer-content"
              {...form.register("content")}
              className="mt-2 h-10 border border-border bg-background/45 px-3 text-foreground placeholder:text-muted"
              placeholder="Comparte tu avance para la comunidad..."
            />
          </FormField>
          <div className="mt-3 h-px w-full bg-white/[0.08]" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#9db2c9]">
              <button type="button" className="inline-flex items-center gap-1.5 transition hover:text-white">
                <ImageIcon className="h-4 w-4" />
                Foto
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 transition hover:text-white">
                <Trophy className="h-4 w-4" />
                PR
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 transition hover:text-white">
                <CalendarDays className="h-4 w-4" />
                Evento
              </button>
            </div>
            <Button
              type="submit"
              size="sm"
              loading={isCreatePending || form.formState.isSubmitting}
              disabled={isCreatePending || form.formState.isSubmitting}
              className="rounded-full bg-secondary px-5 text-background shadow-[0_0_22px_color-mix(in_srgb,var(--secondary)_36%,transparent)] hover:opacity-90"
            >
              <SendHorizontal className="h-4 w-4" />
              {isCreatePending || form.formState.isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
            {isCreatePending ? <span className="ml-2 text-xs text-amber-300">Sincronizando...</span> : null}
          </div>
        </div>
      </div>
    </form>
  );
}

