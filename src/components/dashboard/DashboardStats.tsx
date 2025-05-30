
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStatsProps {
  leaderboard: any[];
}

export const DashboardStats = ({ leaderboard }: DashboardStatsProps) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    wins: 0,
    matchesPlayed: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  const fetchUserStats = async () => {
    try {
      // Get total matches played by user
      const { data: userMatches, error: matchesError } = await supabase
        .from('match_players')
        .select(`
          match_id,
          matches!inner(status, winner_id)
        `)
        .eq('player_id', user.id);

      if (matchesError) throw matchesError;

      const completedMatches = userMatches?.filter(mp => mp.matches.status === 'completed') || [];
      const wins = completedMatches.filter(mp => mp.matches.winner_id === user.id).length;
      const matchesPlayed = completedMatches.length;
      const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

      setUserStats({
        wins,
        matchesPlayed,
        winRate
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-100 rounded mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {userStats.wins}
          </p>
          <p className="text-gray-500 text-xs font-medium">Your Wins</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">{leaderboard.length}</p>
          <p className="text-gray-500 text-xs font-medium">Club Members</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">{userStats.matchesPlayed}</p>
          <p className="text-gray-500 text-xs font-medium">Your Matches</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">{userStats.winRate}%</p>
          <p className="text-gray-500 text-xs font-medium">Win Rate</p>
        </CardContent>
      </Card>
    </div>
  );
};
