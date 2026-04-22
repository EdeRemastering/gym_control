import { Card } from "@/components/ui/card";

export function PostCard({ content, date }: { content: string; date: string }) {
  return (
    <Card>
      <p className="text-sm text-white">{content}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{date}</p>
    </Card>
  );
}
