
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PlayerPresence {
  user_id: string;
  full_name: string;
  online_at: string;
}

export const useRealtimePresence = (matchId: string) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PlayerPresence>>({});

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`match-presence-${matchId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence sync:', state);
        
        const users: Record<string, PlayerPresence> = {};
        Object.entries(state).forEach(([userId, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0];
            // Check if the presence object has the expected structure
            if (presence && 
                typeof presence === 'object' && 
                'user_id' in presence &&
                'full_name' in presence &&
                'online_at' in presence) {
              users[userId] = {
                user_id: presence.user_id as string,
                full_name: presence.full_name as string,
                online_at: presence.online_at as string,
              };
            }
          }
        });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown',
            online_at: new Date().toISOString(),
          });
          console.log('Presence track status:', presenceTrackStatus);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [user, matchId]);

  return { onlineUsers };
};
