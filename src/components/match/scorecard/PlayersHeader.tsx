
import { Check } from 'lucide-react';

interface PlayersHeaderProps {
  players: any[];
  confirmations: Record<string, boolean>;
  calculateTotal: (playerId: string) => number;
  calculateToPar: (playerId: string) => string;
}

export const PlayersHeader = ({ 
  players, 
  confirmations, 
  calculateTotal, 
  calculateToPar 
}: PlayersHeaderProps) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {players.map((player) => (
        <div key={player.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-sm">{player.profiles.full_name}</p>
              <p className="text-xs text-gray-500">HCP: {player.profiles.handicap}</p>
            </div>
            {confirmations[player.profiles.id] && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{calculateTotal(player.profiles.id) || '-'}</div>
            <div className="text-xs text-gray-500">{calculateToPar(player.profiles.id)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
