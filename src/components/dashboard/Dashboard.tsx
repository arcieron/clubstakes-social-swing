
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Users, Sword } from 'lucide-react';

interface DashboardProps {
  user: any;
  onChallenge: () => void;
}

export const Dashboard = ({ user, onChallenge }: DashboardProps) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [user.id]);

  const fetchMatches = async () => {
    try {
      // Fetch matches where user is creator or participant
      const { data: createdMatches } = await supabase
        .from('matches')
        .select(`
          *,
          courses(name),
          match_players(player_id, profiles(full_name))
        `)
        .eq('creator_id', user.id);

      const { data: participantMatches } = await supabase
        .from('match_players')
        .select(`
          matches(
            *,
            courses(name),
            match_players(player_id, profiles(full_name))
          )
        `)
        .eq('player_id', user.id);

      const allMatches = [
        ...(createdMatches || []),
        ...(participantMatches?.map(p => p.matches) || [])
      ];

      // Remove duplicates
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
      );

      setMatches(uniqueMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingMatches = matches.filter(match => match.status === 'pending');
  const completedMatches = matches.filter(match => match.status === 'completed');
  const wonMatches = completedMatches.filter(match => match.winner_id === user.id);

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user.full_name}!
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
            <p className="text-2xl font-bold text-accent">{user.credits?.toLocaleString()}</p>
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
                    <p className="font-medium text-gray-800">{match.courses?.name || 'Course TBD'}</p>
                    <p className="text-sm text-gray-500">{match.format}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(match.match_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-bold">{match.wager_amount} credits</p>
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
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 3).map((match) => (
                <div key={match.id} className="p-3 bg-white border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{match.courses?.name || 'Course TBD'}</p>
                      <p className="text-sm text-gray-500">{match.format}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">{match.wager_amount} credits</p>
                      <Badge className={`text-xs ${getMatchStatusColor(match.status)}`}>
                        {match.status === 'completed' && match.winner_id === user.id ? 'Won' : 
                         match.status === 'completed' ? 'Lost' : match.status}
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
              <p className="text-lg font-bold text-gray-800">{user.ghin_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Matches</p>
              <p className="text-lg font-bold text-gray-800">{matches.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-bold text-gray-800">
                {completedMatches.length > 0 ? Math.round((wonMatches.length / completedMatches.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
