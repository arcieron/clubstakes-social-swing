import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalData } from '@/hooks/useGlobalData';
import { supabase } from '@/integrations/supabase/client';
import { ActiveMatch } from '@/components/match/ActiveMatch';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { LeaderboardCard } from './LeaderboardCard';
import { ActiveMatchesList } from './ActiveMatchesList';
import { MatchHistoryCard } from './MatchHistoryCard';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  user: any;
  onChallenge: () => void;
}

export const Dashboard = ({ user, onChallenge }: DashboardProps) => {
  const { user: authUser, profile, loading } = useAuth();
  const { matches, refreshData } = useGlobalData();
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');

  // Filter matches by status with comprehensive logging
  const activeMatches = matches.filter(m => {
    const isActive = m.status === 'in_progress';
    console.log(`Match ${m.id}: status=${m.status}, isActive=${isActive}, players=${m.match_players?.length}/${m.max_players}`);
    return isActive;
  });

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const completedMatches = matches.filter(m => m.status === 'completed');

  // Add comprehensive logging for all matches
  useEffect(() => {
    console.log('=== DASHBOARD MATCHES ANALYSIS ===');
    console.log('Total matches loaded:', matches.length);
    console.log('Active matches (in_progress):', activeMatches.length);
    console.log('Pending matches:', pendingMatches.length);
    console.log('Completed matches:', completedMatches.length);
    
    // Log details for each active match
    activeMatches.forEach(match => {
      console.log(`Active Match ${match.id}:`);
      console.log(`  Status: ${match.status}`);
      console.log(`  Players: ${match.match_players?.length}/${match.max_players}`);
      console.log(`  Format: ${match.format}`);
    });
    
    // Check for matches that should be active but aren't
    const shouldBeActive = pendingMatches.filter(match => {
      const playerCount = match.match_players?.length || 0;
      const maxPlayers = match.max_players || 8;
      return playerCount >= maxPlayers;
    });
    
    if (shouldBeActive.length > 0) {
      console.warn('=== MATCHES THAT SHOULD BE ACTIVE ===');
      shouldBeActive.forEach(match => {
        console.warn(`Match ${match.id}: ${match.match_players?.length}/${match.max_players} players but status is ${match.status}`);
      });
    }
    
  }, [matches, activeMatches.length, pendingMatches.length]);

  const fetchMatchHistory = async () => {
    if (!authUser || !user?.club_id) return;
    
    console.log('Fetching match history for user:', authUser.id);
    
    try {
      const { data: matchPlayers, error } = await supabase
        .from('match_players')
        .select(`
          match_id,
          matches!inner(
            *,
            courses(name),
            creator_profile:profiles!matches_creator_id_fkey(full_name),
            winner_profile:profiles!matches_winner_id_fkey(full_name)
          )
        `)
        .eq('player_id', authUser.id)
        .eq('matches.status', 'completed')
        .order('matches(completed_at)', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching match history:', error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        console.log('Fetched match history:', matchPlayers);
        const matches = matchPlayers?.map(mp => ({
          ...mp.matches,
          creator_profile: mp.matches.creator_profile,
          winner_profile: mp.matches.winner_profile
        })) || [];
        setMatchHistory(matches);
      }
    } catch (error) {
      console.error('Error in fetchMatchHistory:', error);
      toast({ title: "Error", description: "Failed to fetch match history", variant: "destructive" });
    }
  };

  const fetchLeaderboard = async () => {
    if (user?.club_id) {
      try {
        // First get all profiles in the club
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, credits, handicap')
          .eq('club_id', user.club_id)
          .order('credits', { ascending: false })
          .limit(10);

        if (profilesError) {
          toast({ title: "Error", description: profilesError.message, variant: "destructive" });
          return;
        }

        // Then get win counts for each profile
        const leaderboardWithWins = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: winCount, error: winError } = await supabase
              .from('matches')
              .select('id')
              .eq('winner_id', profile.id)
              .eq('status', 'completed');

            if (winError) {
              console.error('Error fetching wins for profile:', profile.id, winError);
            }

            return {
              id: profile.id,
              name: profile.full_name,
              credits: profile.credits || 0,
              wins: winCount?.length || 0,
              handicap: profile.handicap || 0
            };
          })
        );

        setLeaderboard(leaderboardWithWins);
      } catch (error) {
        console.error('Error in fetchLeaderboard:', error);
        toast({ title: "Error", description: "Failed to fetch leaderboard", variant: "destructive" });
      }
    }
  };

  // Refresh data when tab changes
  useEffect(() => {
    console.log('Tab changed to:', currentTab);
    if (currentTab === 'active') {
      console.log('Refreshing data for Active tab');
      refreshData();
    } else if (currentTab === 'history') {
      fetchMatchHistory();
    } else if (currentTab === 'overview') {
      fetchLeaderboard();
    }
  }, [currentTab]);

  useEffect(() => {
    if (authUser && user?.club_id) {
      fetchMatchHistory();
      fetchLeaderboard();
    }
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

  if (selectedMatchId) {
    return (
      <ActiveMatch 
        matchId={selectedMatchId} 
        onBack={() => {
          setSelectedMatchId(null);
          refreshData();
          fetchMatchHistory();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <DashboardHeader profile={profile} onChallenge={onChallenge} />

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Active Matches ({activeMatches.length})
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
