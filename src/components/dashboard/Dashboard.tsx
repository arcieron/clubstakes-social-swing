
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

  const fetchActiveMatches = async () => {
    if (!authUser) return;
    
    console.log('Fetching active matches for user:', authUser.id);
    
    try {
      // First get all match IDs where the user is a player
      const { data: userMatches, error: userMatchError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('player_id', authUser.id);

      if (userMatchError) {
        console.error('Error fetching user matches:', userMatchError);
        toast({ title: "Error", description: userMatchError.message, variant: "destructive" });
        return;
      }

      if (!userMatches || userMatches.length === 0) {
        console.log('No matches found for user');
        setActiveMatches([]);
        return;
      }

      const matchIds = userMatches.map(um => um.match_id);
      console.log('User is in matches:', matchIds);

      // Now get the full match details for in_progress matches
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          courses(name),
          profiles!matches_creator_id_fkey(full_name),
          match_players(
            player_id,
            team_number,
            profiles(full_name, handicap)
          )
        `)
        .in('id', matchIds)
        .eq('status', 'in_progress');

      if (matchError) {
        console.error('Error fetching match details:', matchError);
        toast({ title: "Error", description: matchError.message, variant: "destructive" });
      } else {
        console.log('Fetched active matches with details:', matches);
        setActiveMatches(matches || []);
      }
    } catch (error) {
      console.error('Error in fetchActiveMatches:', error);
      toast({ title: "Error", description: "Failed to fetch active matches", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchActiveMatches();
    }
  }, [authUser]);

  // Set up real-time subscription for match updates
  useEffect(() => {
    if (!authUser) return;

    console.log('Setting up real-time subscription for match updates');
    
    const channel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Match update received:', payload);
          fetchActiveMatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_players'
        },
        (payload) => {
          console.log('Match players update received:', payload);
          fetchActiveMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

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

  useEffect(() => {
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
              onChallenge={onChallenge}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MatchHistoryCard 
              matchHistory={matchHistory}
              onChallenge={onChallenge}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
