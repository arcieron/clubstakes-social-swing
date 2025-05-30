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
        const { data: matchPlayers, error } = await supabase
          .from('match_players')
          .select(`
            match_id,
            matches!inner(*)
          `)
          .eq('player_id', authUser.id)
          .eq('matches.status', 'pending');

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          const matches = matchPlayers?.map(mp => mp.matches) || [];
          setActiveMatches(matches);
        }
      }
    };

    const fetchMatchHistory = async () => {
      if (authUser) {
        const { data: matchPlayers, error } = await supabase
          .from('match_players')
          .select(`
            match_id,
            matches!inner(*)
          `)
          .eq('player_id', authUser.id)
          .eq('matches.status', 'completed')
          .order('matches(completed_at)', { ascending: false })
          .limit(5);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          const matches = matchPlayers?.map(mp => mp.matches) || [];
          setMatchHistory(matches);
        }
      }
    };

    const fetchLeaderboard = async () => {
      if (user?.club_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, credits, handicap')
          .eq('club_id', user.club_id)
          .order('credits', { ascending: false })
          .limit(10);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          const transformedData = data?.map(profile => ({
            id: profile.id,
            name: profile.full_name,
            credits: profile.credits || 0,
            wins: 0, // TODO: Calculate actual wins from matches
            handicap: profile.handicap || 0
          })) || [];
          setLeaderboard(transformedData);
        }
      }
    };

    fetchActiveMatches();
    fetchMatchHistory();
    fetchLeaderboard();
  }, [authUser, user?.club_id]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <DashboardHeader profile={profile} onChallenge={onChallenge} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Active Matches
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Match History
            </TabsTrigger>
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
