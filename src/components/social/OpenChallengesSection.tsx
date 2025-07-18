
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MapPin, Users, Target } from 'lucide-react';

interface OpenChallenge {
  id: string;
  creator?: {
    full_name: string;
    id: string;
  };
  format: string;
  wager_amount: number;
  match_date: string;
  tee_time?: string;
  holes?: number;
  courses?: {
    name: string;
  };
  match_players?: Array<{
    player_id: string;
  }>;
  max_players: number;
}

interface OpenChallengesSectionProps {
  openChallenges: OpenChallenge[];
  user: any;
  onJoinChallenge: (matchId: string, wagerAmount: number) => void;
  formatGameType: (format: string) => string;
}

export const OpenChallengesSection = ({ 
  openChallenges, 
  user, 
  onJoinChallenge,
  formatGameType 
}: OpenChallengesSectionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTeeTime = (timeString?: string) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (openChallenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Open Challenges
          </CardTitle>
          <CardDescription>Challenges posted to the club feed</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            No open challenges at the moment. Create one to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Open Challenges
        </CardTitle>
        <CardDescription>Join challenges posted by other members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {openChallenges.map((challenge) => {
          const isCreator = challenge.creator?.id === user.id;
          const isAlreadyJoined = challenge.match_players?.some(p => p.player_id === user.id);
          const spotsLeft = challenge.max_players - (challenge.match_players?.length || 0);
          
          return (
            <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {challenge.creator?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{challenge.creator?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">created a challenge</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline">{formatGameType(challenge.format)}</Badge>
                    {challenge.holes && (
                      <Badge variant="secondary" className="text-xs">
                        {challenge.holes} holes
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{challenge.courses?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDate(challenge.match_date)}
                        {challenge.tee_time && (
                          <span className="ml-1 font-medium">
                            @ {formatTeeTime(challenge.tee_time)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                    </div>
                    <div className="font-semibold text-accent">
                      {challenge.wager_amount} credits
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {!isCreator && !isAlreadyJoined && spotsLeft > 0 && (
                    <Button 
                      size="sm" 
                      onClick={() => onJoinChallenge(challenge.id, challenge.wager_amount)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Join Challenge
                    </Button>
                  )}
                  {isCreator && (
                    <Badge variant="secondary" className="text-xs">Your Challenge</Badge>
                  )}
                  {isAlreadyJoined && !isCreator && (
                    <Badge variant="default" className="text-xs">Joined</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
