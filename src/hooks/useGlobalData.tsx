
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
        console.log('=== FETCH MATCHES RESULT ===');
        console.log('Total matches fetched:', data?.length || 0);
        
        // Log each match with detailed status info
        data?.forEach(match => {
          const playerCount = match.match_players?.length || 0;
          const maxPlayers = match.max_players || 8;
          console.log(`Match ${match.id}:`);
          console.log(`  Status: ${match.status}`);
          console.log(`  Players: ${playerCount}/${maxPlayers}`);
          console.log(`  Should be in_progress: ${playerCount >= maxPlayers && match.status !== 'completed'}`);
        });
        
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('=== REFRESHING DATA ===');
    await fetchMatches();
  };

  const joinMatch = async (matchId: string, teamNumber?: number) => {
    try {
      console.log('=== JOINING MATCH ===');
      console.log('Match ID:', matchId, 'User ID:', user.id);
      
      // Step 1: Add player to match
      const { error: insertError } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: user.id,
          team_number: teamNumber || null
        });

      if (insertError) {
        console.error('Error adding player to match:', insertError);
        toast({
          title: "Error",
          description: "Failed to join match. You may already be in this match.",
          variant: "destructive"
        });
        return false;
      }

      console.log('Player added to match successfully');

      // Step 2: Get fresh match data to check if it's now full
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (player_id)
        `)
        .eq('id', matchId)
        .single();

      if (matchError || !matchData) {
        console.error('Error fetching updated match data:', matchError);
        return false;
      }

      const currentPlayerCount = matchData.match_players?.length || 0;
      const maxPlayers = matchData.max_players || 8;
      
      console.log(`Match now has ${currentPlayerCount}/${maxPlayers} players`);
      console.log(`Current status: ${matchData.status}`);

      // Step 3: If match is full and status is 'open', change to 'in_progress'
      if (currentPlayerCount >= maxPlayers && matchData.status === 'open') {
        console.log('=== MATCH IS FULL - UPDATING TO IN_PROGRESS ===');
        
        const { error: updateError } = await supabase
          .from('matches')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (updateError) {
          console.error('Error updating match status:', updateError);
        } else {
          console.log('Match status updated to in_progress successfully');
          
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
      await fetchMatches();
      
      return true;
    } catch (error) {
      console.error('Error in joinMatch:', error);
      toast({
        title: "Error",
        description: "Failed to join match. Please try again.",
        variant: "destructive"
      });
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
          console.log('=== REAL-TIME MATCH UPDATE ===');
          console.log('Event type:', payload.eventType);
          console.log('Payload:', payload);
          
          if (payload.eventType === 'UPDATE') {
            console.log(`Match ${payload.new?.id} status changed:`);
            console.log(`  From: ${payload.old?.status}`);
            console.log(`  To: ${payload.new?.status}`);
            
            // Show notification for status changes to in_progress
            if (payload.new?.status === 'in_progress' && payload.old?.status !== 'in_progress') {
              console.log('=== MATCH ACTIVATED NOTIFICATION ===');
              toast({
                title: "Match Started!",
                description: "A match is now ready to begin! Check your Active Matches tab.",
              });
            }
          }
          
          // Always refresh data on any match change
          setTimeout(() => {
            fetchMatches();
          }, 100);
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
          console.log('=== REAL-TIME PLAYER UPDATE ===');
          console.log('Player update payload:', payload);
          
          // Refresh data immediately when players change
          setTimeout(() => {
            fetchMatches();
          }, 100);
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
