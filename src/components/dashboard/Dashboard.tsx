import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ActiveMatch } from '@/components/match/ActiveMatch';
import { MockAccountCreator } from '@/components/dev/MockAccountCreator';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { LeaderboardCard } from './LeaderboardCard';
import { ActiveMatchesList } from './ActiveMatchesList';
import { MatchHistoryCard } from './MatchHistoryCard';
import { TestTube } from 'lucide-react';
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
        <DashboardHeader profile={profile} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Matches</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats leaderboard={leaderboard} />
            <LeaderboardCard leaderboard={leaderboard} />
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <ActiveMatchesList 
              activeMatches={activeMatches} 
              onMatchSelect={setSelectedMatchId} 
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MatchHistoryCard matchHistory={matchHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
