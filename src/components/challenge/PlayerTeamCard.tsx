
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface Player {
  id: string;
  team?: number;
}

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
}

interface PlayerTeamCardProps {
  player: Player;
  playerProfiles: ProfileData[];
  maxTeams: number;
  onAssignToTeam: (playerId: string, teamNumber: number) => void;
  isUser?: boolean;
  userName?: string;
  userHandicap?: number;
}

export const PlayerTeamCard = ({ 
  player, 
  playerProfiles, 
  maxTeams, 
  onAssignToTeam,
  isUser = false,
  userName,
  userHandicap = 0
}: PlayerTeamCardProps) => {
  const playerData = isUser ? null : playerProfiles.find(u => u.id === player.id);
  const displayName = isUser ? `${userName} (You)` : (playerData?.full_name || 'Loading...');
  const handicap = isUser ? userHandicap : (playerData?.handicap || 0);
  
  const cardClasses = isUser 
    ? "p-3 bg-primary/10 rounded-lg border border-primary/20"
    : "p-3 bg-gray-50 rounded-lg border";

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className={`w-4 h-4 ${isUser ? 'text-primary' : 'text-gray-400'}`} />
          <div>
            <p className={`font-medium ${isUser ? 'text-primary' : 'text-gray-800'}`}>
              {displayName}
            </p>
            <p className="text-xs text-gray-500">Handicap: {handicap}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2].slice(0, maxTeams).map(team => (
            <Button
              key={team}
              variant={player.team === team ? "default" : "outline"}
              size="sm"
              onClick={() => onAssignToTeam(player.id, team)}
              className="w-8 h-8 p-0 text-xs"
            >
              {team}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
