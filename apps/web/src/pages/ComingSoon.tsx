import { Card, CardContent } from '@/components/ui';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  icon?: string;
}

export function ComingSoon({ title, icon = '🚧' }: ComingSoonProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <span className="text-6xl">{icon}</span>
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-center mt-2">This feature is coming soon!</p>
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Construction className="h-4 w-4" />
            <span>Under construction</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
