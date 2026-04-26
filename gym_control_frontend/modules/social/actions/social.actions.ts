export const socialActionCatalog = [
  "create_post",
  "edit_post",
  "soft_delete_post",
  "restore_post",
  "moderate_post",
  "add_comment",
  "remove_comment",
] as const;

export function shareSocialPostToWhatsApp(createdAt: string, mediaUrl: string | null | undefined, displayContent: string) {
  const body = displayContent.trim().slice(0, 3500);
  const parts = ["📣 Zudel OS — Área social", "", body];
  if (mediaUrl) parts.push("", mediaUrl);
  parts.push("", `— ${new Date(createdAt).toLocaleString("es")}`);
  const url = `https://wa.me/?text=${encodeURIComponent(parts.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function normalizeSocialText(value: string) {
  const cleaned = value.replace(/^\?\?\s*/, "");
  const maybeMojibake = /[ÃÂâ]/.test(cleaned);
  if (!maybeMojibake) return cleaned;
  try {
    const bytes = Uint8Array.from(cleaned, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return cleaned;
  }
}
