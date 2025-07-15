
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Calendar, Eye, Trophy, Crown } from 'lucide-react';

interface MatchHistoryCardProps {
  matchHistory: any[];
  onChallenge: () => void;
}

export const MatchHistoryCard = ({ matchHistory, onChallenge }: MatchHistoryCardProps) => {
  const formatGameType = (format: string) => {
    switch (format) {
      case 'match-play': return 'Match Play';
      case 'stroke-play': return 'Stroke Play';
      case 'nassau': return 'Nassau';
      case 'scramble': return 'Scramble';
      case 'better-ball': return 'Better Ball';
      case 'skins': return 'Skins';
      default: return format;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Match History</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Recent Matches
          </CardTitle>
          <CardDescription className="text-gray-500">Your latest completed matches</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {matchHistory.length > 0 ? (
            <div className="space-y-0">
              {matchHistory.map((match, index) => (
                <div 
                  key={match.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    index < matchHistory.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-800">{formatGameType(match.format)}</h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Completed
                        </Badge>
                        {match.courses?.name && (
                          <span className="text-sm text-gray-500">at {match.courses.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {match.completed_at 
                            ? formatTimeAgo(match.completed_at)
                            : new Date(match.match_date).toLocaleDateString()
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {match.wager_amount.toLocaleString()} credits
                        </div>
                      </div>

                      {match.profiles && (
                        <div className="flex items-center gap-2 text-sm">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600">Winner: </span>
                          <span className="font-medium text-gray-800">{match.profiles.full_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Match History</h3>
              <p className="text-gray-500 mb-4">You haven't completed any matches yet.</p>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={onChallenge}
              >
                Play Your First Match
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
