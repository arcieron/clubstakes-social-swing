
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, MessageCircle } from 'lucide-react';

interface Match {
  id: string;
  format: string;
  status: string;
  wager_amount: number;
  created_at: string;
  courses?: {
    name: string;
  };
}

interface RecentResultsSectionProps {
  completedMatches: Match[];
  formatGameType: (format: string) => string;
  formatTimeAgo: (dateString: string) => string;
}

export const RecentResultsSection = ({
  completedMatches,
  formatGameType,
  formatTimeAgo
}: RecentResultsSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        Recent Results
      </h3>
      <div className="space-y-3">
        {completedMatches.length > 0 ? completedMatches.map(match => {
          const isTie = match.status === 'tied';
          
          return (
            <Card key={match.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/90 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-gray-800">
                      <p>
                        {formatGameType(match.format)} match at{' '}
                        <span className="text-primary">{match.courses?.name || 'TBD'}</span>
                        {!isTie && <span className="text-accent"> - {match.wager_amount.toLocaleString()} credits</span>}
                      </p>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-1">
                      {formatTimeAgo(match.created_at)}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-destructive p-2 h-auto">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-xs">12</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary p-2 h-auto">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">3</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No matches completed yet.</p>
              <p className="text-gray-500 text-sm mt-1">Be the first to finish a match!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
