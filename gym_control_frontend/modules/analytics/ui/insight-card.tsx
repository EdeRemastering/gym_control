import { Card } from "@/components/ui/card";

export function InsightCard({ text }: { text: string }) {
  return (
    <Card>
      <p className="text-sm text-white">{text}</p>
    </Card>
  );
}
