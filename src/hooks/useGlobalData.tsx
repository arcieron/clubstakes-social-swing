
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
  created_at: string;
  completed_at?: string;
  winner_id?: string;
  courses?: {
    name: string;
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
          profiles!matches_creator_id_fkey (full_name),
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
        console.log('Fetched matches:', data);
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchMatches();
  };

  const joinMatch = async (matchId: string, teamNumber?: number) => {
    try {
      console.log('Joining match:', matchId, 'with team:', teamNumber);
      
      const match = matches.find(m => m.id === matchId);
      if (!match) {
        console.error('Match not found');
        return false;
      }

      const currentPlayers = match.match_players?.length || 0;
      const maxPlayers = match.max_players || 8;
      
      if (currentPlayers >= maxPlayers) {
        console.error('Match is full');
        return false;
      }

      const { error: insertError } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: user.id,
          team_number: teamNumber || null
        });

      if (insertError) {
        console.error('Error joining match:', insertError);
        return false;
      }

      const newPlayerCount = currentPlayers + 1;
      console.log(`Match ${matchId} now has ${newPlayerCount}/${maxPlayers} players`);
      
      if (newPlayerCount >= maxPlayers) {
        console.log('Match is now full, updating status to in_progress');
        const { error: updateError } = await supabase
          .from('matches')
          .update({ status: 'in_progress' })
          .eq('id', matchId);

        if (updateError) {
          console.error('Error updating match status:', updateError);
        }
      }

      // Data will be refreshed automatically via real-time subscription
      return true;
    } catch (error) {
      console.error('Error in joinMatch:', error);
      return false;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id || !profile?.club_id) return;

    console.log('Setting up global real-time subscriptions');
    
    // Subscribe to match changes
    const matchChannel = supabase
      .channel('global-match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `club_id=eq.${profile.club_id}`
        },
        (payload) => {
          console.log('Global match update received:', payload);
          fetchMatches();
          
          // Show notification for new matches
          if (payload.eventType === 'INSERT' && payload.new?.creator_id !== user.id) {
            toast({
              title: "New Match Created",
              description: `A new ${payload.new.format} match has been created`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to match player changes
    const playerChannel = supabase
      .channel('global-player-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_players'
        },
        (payload) => {
          console.log('Global match players update received:', payload);
          fetchMatches();
          
          // Show notification when someone joins a match
          if (payload.eventType === 'INSERT' && payload.new?.player_id !== user.id) {
            toast({
              title: "Player Joined Match",
              description: "Someone joined a match in your club",
            });
          }
        }
      )
      .subscribe();

    // Initial data fetch
    fetchMatches();

    return () => {
      console.log('Cleaning up global real-time subscriptions');
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
