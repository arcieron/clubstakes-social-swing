

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMatches } from '@/hooks/useMatches';

interface SocialFeedProps {
  user: any;
}

export const SocialFeed = ({ user }: SocialFeedProps) => {
  const { matches, loading, joinMatch } = useMatches(user);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading club feed...</p>
        </div>
      </div>
    );
  }

  const completedMatches = matches.filter(m => 
    m.status === 'completed' || m.status === 'tied'
  );

  const openChallenges = matches.filter(m => 
    m.status === 'open' && 
    m.is_public
  );
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

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

    const success = await joinMatch(matchId);
    if (success) {
      toast({
        title: "Joined Challenge!",
        description: "You've successfully joined the challenge."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to join the challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

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
  
  return (
    <div className="p-4 space-y-6">
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
              <Trophy className="w-6 h-6 text-accent" />
              Club Feed
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Latest results from {user.clubs?.name || 'your club'}
            </CardDescription>
          </div>
        </div>
      </Card>

      {/* Open Challenges Section */}
      {openChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Open Challenges
          </h3>
          <div className="space-y-3">
            {openChallenges.map(challenge => {
              const currentPlayers = challenge.match_players?.length || 1; // Include creator
              const maxPlayers = challenge.max_players || 8;
              const isUserInMatch = challenge.match_players?.some(p => p.player_id === user.id) || challenge.creator_id === user.id;
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
      )}

      {/* Completed Matches Section */}
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
    </div>
  );
};

