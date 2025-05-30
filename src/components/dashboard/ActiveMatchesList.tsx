
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ActiveMatchesListProps {
  activeMatches: any[];
  onMatchSelect: (matchId: string) => void;
}

export const ActiveMatchesList = ({ activeMatches, onMatchSelect }: ActiveMatchesListProps) => {
  return (
    <div className="grid gap-6">
      {activeMatches.length > 0 ? (
        activeMatches.map((match) => (
          <Card 
            key={match.id} 
            className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onMatchSelect(match.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{match.format}</h3>
                  <p className="text-sm text-gray-500">{new Date(match.match_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{match.wager_amount} credits</p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {match.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Matches</h3>
            <p className="text-gray-500">You don't have any matches in progress right now.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
