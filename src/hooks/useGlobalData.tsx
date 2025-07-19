
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
      console.log('=== JOINING MATCH DEBUG ===');
      console.log('Match ID:', matchId, 'Team:', teamNumber);
      
      // First, get the current match details and FRESH player count from database
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (player_id)
        `)
        .eq('id', matchId)
        .single();

      if (matchError || !matchData) {
        console.error('Error fetching match data:', matchError);
        return false;
      }

      const currentPlayers = matchData.match_players?.length || 0;
      const maxPlayers = matchData.max_players || 8;
      
      console.log(`Match ${matchId} currently has ${currentPlayers}/${maxPlayers} players`);
      console.log('Current match status:', matchData.status);
      
      if (currentPlayers >= maxPlayers) {
        console.error('Match is full');
        toast({
          title: "Match Full",
          description: "This match is already full",
          variant: "destructive"
        });
        return false;
      }

      // Check if user is already in the match
      const isAlreadyJoined = matchData.match_players?.some(mp => mp.player_id === user.id);
      if (isAlreadyJoined) {
        console.error('User already joined this match');
        toast({
          title: "Already Joined",
          description: "You are already in this match",
          variant: "destructive"
        });
        return false;
      }

      // Add the player to the match
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
      
      // Check if match is now full and update status if needed
      if (newPlayerCount >= maxPlayers) {
        console.log('=== UPDATING MATCH STATUS TO IN_PROGRESS ===');
        console.log('Match was:', matchData.status, 'updating to: in_progress');
        
        const { data: updateData, error: updateError } = await supabase
          .from('matches')
          .update({ status: 'in_progress' })
          .eq('id', matchId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating match status:', updateError);
        } else {
          console.log('Match status successfully updated:', updateData);
          console.log('New status should be:', updateData.status);
        }
      }

      console.log('Successfully joined match, refreshing data...');
      // Refresh data to get the latest state
      await fetchMatches();
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
          console.log('=== REAL-TIME MATCH UPDATE ===');
          console.log('Event type:', payload.eventType);
          console.log('Payload:', payload);
          
          if (payload.eventType === 'UPDATE') {
            console.log('Match status changed from:', payload.old?.status, 'to:', payload.new?.status);
          }
          
          fetchMatches();
          
          // Show notification for new matches
          if (payload.eventType === 'INSERT' && payload.new?.creator_id !== user.id) {
            toast({
              title: "New Match Created",
              description: `A new ${payload.new.format} match has been created`,
            });
          }
          
          // Show notification for status changes to in_progress
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'in_progress' && payload.old?.status !== 'in_progress') {
            console.log('=== MATCH STARTED NOTIFICATION ===');
            toast({
              title: "Match Started",
              description: "A match is now ready to begin!",
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
          console.log('=== REAL-TIME PLAYER UPDATE ===');
          console.log('Player update payload:', payload);
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
