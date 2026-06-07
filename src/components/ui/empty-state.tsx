import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
