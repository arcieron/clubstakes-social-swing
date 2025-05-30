
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  }>;
}

export const useMatches = (user: any) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.club_id) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches for club:', user.club_id);
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          courses (name),
          profiles!matches_creator_id_fkey (full_name),
          match_players (player_id, team_number)
        `)
        .eq('club_id', user.club_id)
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

  const joinMatch = async (matchId: string) => {
    try {
      console.log('Joining match:', matchId);
      
      // Add user to match_players
      const { error } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: user.id
        });

      if (error) {
        console.error('Error joining match:', error);
        return false;
      }

      // Refresh matches
      await fetchMatches();
      return true;
    } catch (error) {
      console.error('Error in joinMatch:', error);
      return false;
    }
  };

  return { matches, loading, joinMatch, refetch: fetchMatches };
};
