
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Match {
  id: string;
  creator_id: string;
  format: string;
  wager_amount: number;
  match_date: string;
  max_players?: number;
  courses?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
  match_players?: Array<{
    player_id: string;
    team_number?: number;
  }>;
}

interface OpenChallengesSectionProps {
  openChallenges: Match[];
  user: any;
  onJoinChallenge: (matchId: string, wagerAmount: number) => Promise<void>;
  formatGameType: (format: string) => string;
}

export const OpenChallengesSection = ({
  openChallenges,
  user,
  onJoinChallenge,
  formatGameType
}: OpenChallengesSectionProps) => {
  if (openChallenges.length === 0) return null;

  const handleJoinChallenge = async (matchId: string, wagerAmount: number) => {
    // Check if user has enough credits
    const userCredits = user.credits || 0;
    if (userCredits < wagerAmount) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${wagerAmount.toLocaleString()} credits to join this challenge. You have ${userCredits.toLocaleString()} credits.`,
        variant: "destructive"
      });
      return;
    }

    await onJoinChallenge(matchId, wagerAmount);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Open Challenges
      </h3>
      <div className="space-y-3">
        {openChallenges.map(challenge => {
          // Current players includes all match_players (including creator)
          const currentPlayers = challenge.match_players?.length || 0;
          const maxPlayers = challenge.max_players || 8;
          const isUserInMatch = challenge.match_players?.some(p => p.player_id === user.id);
          const hasAvailableSpots = currentPlayers < maxPlayers;
          const userCredits = user.credits || 0;
          const hasEnoughCredits = userCredits >= challenge.wager_amount;
          
          return (
            <Card key={challenge.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {formatGameType(challenge.format)}
                    </h4>
                    <p className="text-sm text-gray-600">Created by {challenge.profiles?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{challenge.wager_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">credits</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {challenge.courses?.name || 'TBD'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(challenge.match_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {currentPlayers}/{maxPlayers}
                  </div>
                </div>

                {!hasEnoughCredits && !isUserInMatch && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      You need {challenge.wager_amount.toLocaleString()} credits to join. 
                      You have {userCredits.toLocaleString()} credits.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleJoinChallenge(challenge.id, challenge.wager_amount)}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={!hasAvailableSpots || isUserInMatch || !hasEnoughCredits}
                >
                  {isUserInMatch ? 'Already Joined' : 
                   !hasAvailableSpots ? 'Challenge Full' : 
                   !hasEnoughCredits ? 'Insufficient Credits' : 'Join Challenge'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
