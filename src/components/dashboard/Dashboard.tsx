
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
      <Card className="bg-gradient-to-r from-green-800 to-green-700 border-green-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Your Credits</CardTitle>
          <div className="text-4xl font-bold text-green-200 mt-2">
            {formatCurrency(user.credits)}
          </div>
          <CardDescription className="text-green-300">
            Season Credits Available
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Challenge CTA */}
      <Button 
        onClick={onChallenge}
        className="w-full h-14 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-lg font-semibold"
      >
        🏌️ Challenge a Player
      </Button>

      {/* Recent Matches */}
      <Card className="bg-gray-800 border-green-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
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
                <div key={match.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">vs {opponent?.fullName}</p>
                    <p className="text-gray-400 text-sm">{match.course}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      isTie ? 'text-yellow-400' : userWon ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isTie ? 'TIE' : userWon ? 'WON' : 'LOST'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {isTie ? '0' : userWon ? '+' : '-'}{formatCurrency(match.wagerAmount)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center py-4">No matches yet. Challenge someone!</p>
          )}
        </CardContent>
      </Card>

      {/* Club Leaderboard */}
      <Card className="bg-gray-800 border-green-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Club Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clubMembers.map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-yellow-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-amber-600 text-amber-900' :
                  'bg-gray-600 text-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium ${member.id === user.id ? 'text-green-400' : 'text-white'}`}>
                    {member.fullName} {member.id === user.id && '(You)'}
                  </p>
                  <p className="text-gray-400 text-sm">HCP: {member.handicap}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{formatCurrency(member.credits)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-green-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{user.handicap}</p>
            <p className="text-gray-400 text-sm">Handicap</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-green-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{userMatches.length}</p>
            <p className="text-gray-400 text-sm">Matches Played</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
