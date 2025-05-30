import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ActiveMatch } from '@/components/match/ActiveMatch';
import { MockAccountCreator } from '@/components/dev/MockAccountCreator';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Play,
  UserCheck,
  Clock,
  Target,
  Award,
  Settings,
  TestTube
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  user: any;
  onChallenge: () => void;
}

export const Dashboard = ({ user, onChallenge }: DashboardProps) => {
  const { user: authUser, profile, loading } = useAuth();
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveMatches = async () => {
      if (authUser) {
        const { data: matches, error } = await supabase
          .from('matches')
          .select('*')
          .contains('players', [{ id: authUser.id }])
          .eq('status', 'pending');

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          setActiveMatches(matches || []);
        }
      }
    };

    const fetchMatchHistory = async () => {
      if (authUser) {
        const { data: history, error } = await supabase
          .from('matches')
          .select('*')
          .contains('players', [{ id: authUser.id }])
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          setMatchHistory(history || []);
        }
      }
    };

    const fetchLeaderboard = async () => {
      // Mock leaderboard data (replace with actual data fetching)
      const mockLeaderboard = [
        { id: 'user1', name: 'John Smith', wins: 12, credits: 12500 },
        { id: 'user2', name: 'Mike Johnson', wins: 8, credits: 9800 },
        { id: 'user3', name: 'Sarah Davis', wins: 15, credits: 15200 },
        { id: 'user4', name: 'Tom Wilson', wins: 5, credits: 8500 },
        { id: 'user5', name: 'Robert Garcia', wins: 18, credits: 18900 }
      ];
      setLeaderboard(mockLeaderboard);
    };

    fetchActiveMatches();
    fetchMatchHistory();
    fetchLeaderboard();
  }, [authUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If a match is selected, show the ActiveMatch component
  if (selectedMatchId) {
    return (
      <ActiveMatch 
        matchId={selectedMatchId} 
        onBack={() => setSelectedMatchId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {profile?.full_name}!</h1>
              <p className="text-gray-600 mt-1">{profile?.clubs?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{profile?.credits?.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Available Credits</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Matches</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
            {profile?.is_admin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            <TabsTrigger value="dev">
              <TestTube className="w-4 h-4 mr-1" />
              Dev Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {leaderboard.length > 0 ? leaderboard[0].wins : 0}
                  </p>
                  <p className="text-gray-500 text-sm">Most Wins</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{leaderboard.length}</p>
                  <p className="text-gray-500 text-sm">Total Players</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">32</p>
                  <p className="text-gray-500 text-sm">Matches Played</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Leaderboard</CardTitle>
                <CardDescription className="text-gray-500">Top players this season</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Player
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wins
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaderboard.map((player, index) => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{index + 1}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{player.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{player.wins}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{player.credits.toLocaleString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-6">
              {activeMatches.length > 0 ? (
                activeMatches.map((match) => (
                  <Card key={match.id} className="border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMatchId(match.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">{match.format}</h3>
                          <p className="text-sm text-gray-500">{new Date(match.match_date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{match.wager_amount} credits</p>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary">
                          {match.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Matches</h3>
                    <p className="text-gray-500">You don't have any matches in progress right now.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Match History</CardTitle>
                <CardDescription className="text-gray-500">Your recent matches</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {matchHistory.length > 0 ? (
                  <div className="space-y-4">
                    {matchHistory.map((match) => (
                      <div key={match.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{match.format}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(match.match_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            {match.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">No Match History</p>
                    <p className="text-gray-500">You haven't completed any matches yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.is_admin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel user={profile} />
            </TabsContent>
          )}

          <TabsContent value="dev" className="space-y-6">
            <MockAccountCreator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
