

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClubMembers = (user: any) => {
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.club_id) {
      fetchClubMembers();
    }
  }, [user]);

  const fetchClubMembers = async () => {
    try {
      console.log('Fetching club members for club:', user.club_id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, handicap, id_number, credits')
        .eq('club_id', user.club_id)
        .neq('id', user.id) // Exclude current user
        .order('full_name');

      if (error) {
        console.error('Error fetching club members:', error);
      } else {
        console.log('Fetched club members:', data);
        setClubMembers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchClubMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  return { clubMembers, loading, refetch: fetchClubMembers };
};

