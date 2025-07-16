
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useRealtimePresence } from './useRealtimePresence';

interface OnlinePlayersIndicatorProps {
  matchId: string;
  players: any[];
}

export const OnlinePlayersIndicator = ({ matchId, players }: OnlinePlayersIndicatorProps) => {
  const { onlineUsers } = useRealtimePresence(matchId);

  const onlinePlayerNames = Object.values(onlineUsers)
    .map(presence => {
      const player = players.find(p => p.profiles.id === presence.user_id);
      return player ? player.profiles.full_name.split(' ')[0] : presence.full_name.split(' ')[0];
    })
    .filter(Boolean);

  if (onlinePlayerNames.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
      <Users className="w-4 h-4 text-green-600" />
      <span className="text-sm text-green-800">Online:</span>
      <div className="flex gap-1">
        {onlinePlayerNames.map((name, index) => (
          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
