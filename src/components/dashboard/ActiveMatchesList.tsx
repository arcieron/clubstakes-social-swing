
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, DollarSign, Users } from 'lucide-react';

interface ActiveMatchesListProps {
  activeMatches: any[];
  onMatchSelect: (matchId: string) => void;
  onChallenge: () => void;
}

export const ActiveMatchesList = ({ activeMatches, onMatchSelect, onChallenge }: ActiveMatchesListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Active Matches</h2>
        <Badge variant="outline" className="text-primary border-primary">
          {activeMatches.length} active
        </Badge>
      </div>

      {activeMatches.length > 0 ? (
        <div className="grid gap-4">
          {activeMatches.map((match) => (
            <Card 
              key={match.id} 
              className="border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onMatchSelect(match.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{match.format}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(match.match_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {match.wager_amount} credits
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {match.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>Waiting for players</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Matches</h3>
            <p className="text-gray-500 mb-4">You don't have any matches in progress right now.</p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={onChallenge}
            >
              Start New Match
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
