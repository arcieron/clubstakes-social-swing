
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
}

interface Player {
  id: string;
  team?: number;
}

export const usePlayerProfiles = (selectedPlayers: Player[]) => {
  const [playerProfiles, setPlayerProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    fetchPlayerProfiles();
  }, [selectedPlayers]);

  const fetchPlayerProfiles = async () => {
    if (selectedPlayers.length === 0) return;

    const playerIds = selectedPlayers.map(p => p.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, handicap')
        .in('id', playerIds);

      if (error) {
        console.error('Error fetching player profiles:', error);
      } else {
        setPlayerProfiles(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPlayerProfiles:', error);
    }
  };

  return { playerProfiles };
};
