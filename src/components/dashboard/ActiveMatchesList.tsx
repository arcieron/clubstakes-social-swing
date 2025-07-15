
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ActiveMatchesListProps {
  activeMatches: any[];
  onMatchSelect: (matchId: string) => void;
  onChallenge: () => void;
}

export const ActiveMatchesList = ({ activeMatches, onMatchSelect, onChallenge }: ActiveMatchesListProps) => {
  const { user } = useAuth();

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
          {activeMatches.map((match) => {
            const playerCount = match.match_players?.length || 0;
            const playerNames = match.match_players?.map((mp: any) => mp.profiles?.full_name).filter(Boolean).join(', ') || '';
            const isUserInMatch = match.match_players?.some((mp: any) => mp.player_id === user?.id);
            
            return (
              <Card 
                key={match.id} 
                className="border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onMatchSelect(match.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">{match.format}</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          In Progress
                        </Badge>
                        {isUserInMatch && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Your Match
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.match_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {match.wager_amount.toLocaleString()} credits
                        </div>
                        {match.courses?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.courses.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{playerCount} players</span>
                      {match.max_players && (
                        <span className="text-gray-400">/ {match.max_players} max</span>
                      )}
                    </div>
                    
                    {playerNames && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Players: </span>
                        <span>{playerNames}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-xs text-gray-500">
                        Created by {match.profiles?.full_name}
                      </div>
                      <Button variant="outline" size="sm">
                        {isUserInMatch ? 'Enter Match' : 'View Match'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Matches</h3>
            <p className="text-gray-500 mb-4">There are no matches in progress in your club right now.</p>
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
