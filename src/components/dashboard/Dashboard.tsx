
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMatches, mockUsers } from '@/lib/mockData';
import { Trophy, TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
  user: any;
  onChallenge: () => void;
}

export const Dashboard = ({ user, onChallenge }: DashboardProps) => {
  // Get user's recent matches
  const userMatches = mockMatches
    .filter(m => m.player1Id === user.id || m.player2Id === user.id)
    .slice(0, 3);

  // Get club leaderboard
  const clubMembers = mockUsers
    .filter(u => u.clubId === user.clubId)
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Credits Overview */}
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-light">Your Credits</h2>
            <div className="text-4xl font-bold mt-2">
              {formatCurrency(user.credits)}
            </div>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Season Credits Available
            </p>
          </div>
        </div>
      </Card>

      {/* Challenge CTA */}
      <Button 
        onClick={onChallenge}
        className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold shadow-md"
      >
        🏌️ Challenge a Player
      </Button>

      {/* Recent Matches */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-800 flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userMatches.length > 0 ? (
            userMatches.map((match) => {
              const opponent = mockUsers.find(u => 
                u.id === (match.player1Id === user.id ? match.player2Id : match.player1Id)
              );
              const userWon = match.winnerId === user.id;
              const isTie = match.status === 'tied';
              
              return (
                <div key={match.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-gray-800 font-medium">vs {opponent?.fullName}</p>
                    <p className="text-gray-500 text-sm">{match.course}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      isTie ? 'text-amber-500' : userWon ? 'text-primary' : 'text-red-500'
                    }`}>
                      {isTie ? 'TIE' : userWon ? 'WON' : 'LOST'}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {isTie ? '0' : userWon ? '+' : '-'}{formatCurrency(match.wagerAmount)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">No matches yet. Challenge someone!</p>
          )}
        </CardContent>
      </Card>

      {/* Club Leaderboard */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-800 flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Club Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clubMembers.map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-accent text-accent-foreground' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-amber-700/80 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium ${member.id === user.id ? 'text-primary' : 'text-gray-800'}`}>
                    {member.fullName} {member.id === user.id && '(You)'}
                  </p>
                  <p className="text-gray-500 text-sm">HCP: {member.handicap}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-bold">{formatCurrency(member.credits)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{user.handicap}</p>
            <p className="text-gray-500 text-sm">Handicap</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{userMatches.length}</p>
            <p className="text-gray-500 text-sm">Matches Played</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
