
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  full_name: string;
  id_number: number;
  handicap: number;
  credits: number;
  club_id: string;
}

export const useClubMembers = (user: any) => {
  const [clubMembers, setClubMembers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubMembers();
  }, [user]);

  const fetchClubMembers = async () => {
    // Try multiple ways to get club_id from user object
    const userClubId = user?.club_id || user?.profile?.club_id;
    
    if (!userClubId) {
      console.log('No club_id found for user:', user);
      setLoading(false);
      return;
    }

    console.log('Fetching club members for club_id:', userClubId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, id_number, handicap, credits, club_id')
        .eq('club_id', userClubId)
        .neq('id', user.id);

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

  return { clubMembers, loading };
};
