
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockUsers, mockMatches } from '@/lib/mockData';
import { Trophy, TrendingUp, Users, Sword } from 'lucide-react';

interface DashboardProps {
  user: any;
  onChallenge: () => void;
}

export const Dashboard = ({ user, onChallenge }: DashboardProps) => {
  // Get user's matches
  const userMatches = mockMatches.filter(match => 
    match.player1Id === user.id || match.player2Id === user.id
  );
  
  const pendingMatches = userMatches.filter(match => match.status === 'pending');
  const completedMatches = userMatches.filter(match => match.status === 'completed');
  const wonMatches = completedMatches.filter(match => match.winnerId === user.id);

  // Get recent activity
  const recentMatches = userMatches
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getOpponentName = (match: any) => {
    const opponentId = match.player1Id === user.id ? match.player2Id : match.player1Id;
    const opponent = mockUsers.find(u => u.id === opponentId);
    return opponent?.fullName || 'Unknown';
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user.fullName}!
        </h2>
        <p className="text-gray-600 mb-4">Ready for your next match?</p>
        <Button 
          onClick={onChallenge}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
        >
          <Sword className="w-5 h-5 mr-2" />
          Challenge
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{wonMatches.length}</p>
            <p className="text-sm text-gray-600">Wins</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{user.credits.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Matches */}
      {pendingMatches.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Matches
            </CardTitle>
            <CardDescription className="text-orange-600">
              Matches waiting for opponents to accept
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pendingMatches.map((match) => (
              <div key={match.id} className="p-3 bg-white border border-orange-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">vs {getOpponentName(match)}</p>
                    <p className="text-sm text-gray-500">{match.course}</p>
                    <p className="text-sm text-gray-500">{match.format}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-bold">{match.wagerAmount} credits</p>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary">Recent Activity</CardTitle>
          <CardDescription>Your latest matches and challenges</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {recentMatches.length > 0 ? (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="p-3 bg-white border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">vs {getOpponentName(match)}</p>
                      <p className="text-sm text-gray-500">{match.course} • {match.format}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">{match.wagerAmount} credits</p>
                      <Badge className={`text-xs ${getMatchStatusColor(match.status)}`}>
                        {match.status === 'completed' && match.winnerId === user.id ? 'Won' : 
                         match.status === 'completed' ? 'Lost' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Challenge someone to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-700">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Handicap</p>
              <p className="text-lg font-bold text-gray-800">{user.handicap}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GHIN ID</p>
              <p className="text-lg font-bold text-gray-800">{user.ghinId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Matches</p>
              <p className="text-lg font-bold text-gray-800">{userMatches.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-bold text-gray-800">
                {userMatches.length > 0 ? Math.round((wonMatches.length / completedMatches.length) * 100) || 0 : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
