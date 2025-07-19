
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Match {
  id: string;
  creator_id: string;
  club_id: string;
  format: string;
  course_id: string;
  wager_amount: number;
  match_date: string;
  team_format: string;
  status: string;
  is_public: boolean;
  max_players?: number;
  holes?: number;
  tee_time?: string;
  created_at: string;
  completed_at?: string;
  winner_id?: string;
  courses?: {
    name: string;
  };
  creator?: {
    full_name: string;
    id: string;
  };
  profiles?: {
    full_name: string;
  };
  match_players?: Array<{
    player_id: string;
    team_number?: number;
    profiles?: {
      full_name: string;
      handicap: number;
    };
  }>;
}

interface GlobalDataContextType {
  matches: Match[];
  loading: boolean;
  refreshData: () => Promise<void>;
  joinMatch: (matchId: string, teamNumber?: number) => Promise<boolean>;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!user?.id || !profile?.club_id) return;
    
    try {
      console.log('Fetching matches for club:', profile.club_id);
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          courses (name),
          creator:profiles!matches_creator_id_fkey (full_name, id),
          match_players (
            player_id, 
            team_number,
            profiles(full_name, handicap)
          )
        `)
        .eq('club_id', profile.club_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
      } else {
        console.log('Fetched matches:', data?.length || 0);
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('Refreshing data...');
    await fetchMatches();
  };

  const joinMatch = async (matchId: string, teamNumber?: number) => {
    if (!user?.id) {
      console.error('No user ID available');
      return false;
    }

    console.log('=== JOINING MATCH ===');
    console.log('Match ID:', matchId);
    console.log('User ID:', user.id);

    try {
      // Step 1: Add the player to the match
      const { error: joinError } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: user.id,
          team_number: teamNumber || null
        });

      if (joinError) {
        console.error('Failed to join match:', joinError);
        toast({
          title: "Error",
          description: "Failed to join match. You may already be in this match.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Successfully joined match');

      // Step 2: Get the current match details including player count
      const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (player_id)
        `)
        .eq('id', matchId)
        .single();

      if (fetchError || !matchData) {
        console.error('Failed to fetch match data:', fetchError);
        await refreshData(); // Still refresh to show the user joined
        return true;
      }

      const currentPlayers = matchData.match_players?.length || 0;
      const maxPlayers = matchData.max_players || 8;
      
      console.log(`Match ${matchId}:`);
      console.log(`- Current status: ${matchData.status}`);
      console.log(`- Players: ${currentPlayers}/${maxPlayers}`);
      console.log(`- Should activate: ${currentPlayers >= maxPlayers && matchData.status === 'open'}`);

      // Step 3: If match is full AND status is 'open', change to 'in_progress'
      if (currentPlayers >= maxPlayers && matchData.status === 'open') {
        console.log('Match is full! Updating status to in_progress...');
        
        const { error: updateError } = await supabase
          .from('matches')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (updateError) {
          console.error('Failed to update match status:', updateError);
        } else {
          console.log('Successfully updated match status to in_progress');
          toast({
            title: "Match Started!",
            description: "The match is now full and ready to begin! Check your Active Matches tab.",
          });
        }
      } else {
        toast({
          title: "Joined Successfully!",
          description: "You've joined the match successfully."
        });
      }

      // Step 4: Refresh data to show updated state
      await refreshData();
      return true;

    } catch (error) {
      console.error('Unexpected error joining match:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id || !profile?.club_id) return;

    console.log('Setting up real-time subscriptions');
    
    // Subscribe to match changes
    const matchChannel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `club_id=eq.${profile.club_id}`
        },
        (payload) => {
          console.log('Match update:', payload);
          setTimeout(() => fetchMatches(), 100);
        }
      )
      .subscribe();

    // Subscribe to match player changes
    const playerChannel = supabase
      .channel('player-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_players'
        },
        (payload) => {
          console.log('Player update:', payload);
          setTimeout(() => fetchMatches(), 100);
        }
      )
      .subscribe();

    // Initial data fetch
    fetchMatches();

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [user?.id, profile?.club_id]);

  return (
    <GlobalDataContext.Provider value={{
      matches,
      loading,
      refreshData,
      joinMatch
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
};
