
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockMatches, mockUsers, mockCourses } from '@/lib/mockData';
import { Heart, MessageCircle, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SocialFeedProps {
  user: any;
}

export const SocialFeed = ({ user }: SocialFeedProps) => {
  const completedMatches = mockMatches.filter(m => 
    m.status === 'completed' && 
    (mockUsers.find(u => u.id === m.player1Id)?.clubId === user.clubId || 
     mockUsers.find(u => u.id === m.player2Id)?.clubId === user.clubId)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openChallenges = mockMatches.filter(m => 
    m.status === 'open' && 
    mockUsers.find(u => u.id === m.player1Id)?.clubId === user.clubId &&
    m.player1Id !== user.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleJoinChallenge = (matchId: string) => {
    const match = mockMatches.find(m => m.id === matchId);
    if (match) {
      // Add user to the match
      match.players.push({ id: user.id });
      match.status = 'pending' as const;
      match.player2Id = user.id; // For compatibility
      
      toast({
        title: "Joined Challenge!",
        description: `You've joined the ${match.format} challenge.`
      });
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
              Latest results from {user.clubName}
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
              const creator = mockUsers.find(u => u.id === challenge.player1Id);
              const course = mockCourses.find(c => c.id === challenge.courseId || c.name === challenge.course);
              const currentPlayers = challenge.players?.length || 1;
              const maxPlayers = challenge.maxPlayers || 8;
              
              return (
                <Card key={challenge.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {challenge.format === 'match-play' ? 'Match Play' : 
                           challenge.format === 'stroke-play' ? 'Stroke Play' :
                           challenge.format === 'nassau' ? 'Nassau' :
                           challenge.format === 'scramble' ? 'Scramble' :
                           challenge.format === 'better-ball' ? 'Better Ball' :
                           challenge.format === 'skins' ? 'Skins' : challenge.format}
                        </h4>
                        <p className="text-sm text-gray-600">Created by {creator?.fullName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{challenge.wagerAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">credits</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {course?.name || challenge.course}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(challenge.matchDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {currentPlayers}/{maxPlayers}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={currentPlayers >= maxPlayers}
                    >
                      {currentPlayers >= maxPlayers ? 'Challenge Full' : 'Join Challenge'}
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
            const player1 = mockUsers.find(u => u.id === match.player1Id);
            const player2 = mockUsers.find(u => u.id === match.player2Id);
            const winner = mockUsers.find(u => u.id === match.winnerId);
            const loser = mockUsers.find(u => u.id === (match.winnerId === match.player1Id ? match.player2Id : match.player1Id));
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
                        {isTie ? (
                          <p>
                            <span className="font-bold">{player1?.fullName}</span> and{' '}
                            <span className="font-bold">{player2?.fullName}</span> tied in{' '}
                            {match.format === 'match-play' ? 'Match Play' : 'Stroke Play'} at{' '}
                            <span className="text-primary">{match.course}</span>
                          </p>
                        ) : (
                          <p>
                            <span className="font-bold text-primary">{winner?.fullName}</span> beat{' '}
                            <span className="font-bold">{loser?.fullName}</span> in{' '}
                            {match.format === 'match-play' ? 'Match Play' : 'Stroke Play'} at{' '}
                            <span className="text-primary">{match.course}</span>
                            {!isTie && <span className="text-accent">, won {match.wagerAmount.toLocaleString()} credits</span>}
                          </p>
                        )}
                      </div>
                      
                      <p className="text-gray-500 text-sm mt-1">
                        {formatTimeAgo(match.createdAt)}
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
