
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface FeedHeaderProps {
  clubName?: string;
}

export const FeedHeader = ({ clubName }: FeedHeaderProps) => {
  return (
    <Card className="border-primary/10 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
        <div className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
            <Trophy className="w-6 h-6 text-accent" />
            Club Feed
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Latest results from {clubName || 'your club'}
          </CardDescription>
        </div>
      </div>
    </Card>
  );
};
