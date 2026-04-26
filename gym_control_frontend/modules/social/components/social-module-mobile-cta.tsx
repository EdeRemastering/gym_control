"use client";

import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type SocialModuleMobileCtaProps = {
  onFocusComposer: () => void;
};

export function SocialModuleMobileCta({ onFocusComposer }: SocialModuleMobileCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 px-3 md:bottom-4 xl:hidden">
      <Button
        type="button"
        onClick={onFocusComposer}
        className="h-11 w-full rounded-full bg-secondary text-background shadow-[0_0_24px_color-mix(in_srgb,var(--secondary)_40%,transparent)]"
      >
        <SendHorizontal className="h-4 w-4" />
        Publicar contenido
      </Button>
    </div>
  );
}

