import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockMatches, mockUsers } from '@/lib/mockData';
import { Heart, MessageCircle, Trophy } from 'lucide-react';
interface SocialFeedProps {
  user: any;
}
export const SocialFeed = ({
  user
}: SocialFeedProps) => {
  const completedMatches = mockMatches.filter(m => m.status === 'completed' && (mockUsers.find(u => u.id === m.player1Id)?.clubId === user.clubId || mockUsers.find(u => u.id === m.player2Id)?.clubId === user.clubId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };
  return <div className="p-4 space-y-6">
      <Card className="border-primary">
        <CardHeader className="text-center bg-primary text-white">
          <CardTitle className="text-white font-light">Club Feed</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Latest match results from {user.clubName}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {completedMatches.length > 0 ? completedMatches.map(match => {
        const player1 = mockUsers.find(u => u.id === match.player1Id);
        const player2 = mockUsers.find(u => u.id === match.player2Id);
        const winner = mockUsers.find(u => u.id === match.winnerId);
        const loser = mockUsers.find(u => u.id === (match.winnerId === match.player1Id ? match.player2Id : match.player1Id));
        const isTie = match.status === 'tied';
        return <Card key={match.id} className="border-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-foreground">
                        {isTie ? <p>
                            <span className="font-bold">{player1?.fullName}</span> and{' '}
                            <span className="font-bold">{player2?.fullName}</span> tied in{' '}
                            {match.format === 'match-play' ? 'Match Play' : 'Stroke Play'} at{' '}
                            <span className="text-primary">{match.course}</span>
                          </p> : <p>
                            <span className="font-bold text-primary">{winner?.fullName}</span> beat{' '}
                            <span className="font-bold">{loser?.fullName}</span> in{' '}
                            {match.format === 'match-play' ? 'Match Play' : 'Stroke Play'} at{' '}
                            <span className="text-primary">{match.course}</span>
                            {!isTie && <span className="text-accent">, won {match.wagerAmount.toLocaleString()} credits</span>}
                          </p>}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mt-1">
                        {formatTimeAgo(match.createdAt)}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive p-2">
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-xs">12</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-2">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">3</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>;
      }) : <Card className="border-primary">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No matches completed yet.</p>
              <p className="text-muted/70 text-sm mt-1">Be the first to finish a match!</p>
            </CardContent>
          </Card>}
      </div>
    </div>;
};