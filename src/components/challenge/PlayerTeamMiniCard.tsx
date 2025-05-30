
import { Button } from '@/components/ui/button';
import { User, Move } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Player {
  id: string;
  team?: number;
}

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
}

interface PlayerTeamMiniCardProps {
  player: Player;
  playerProfiles: ProfileData[];
  currentTeam: number;
  totalTeams: number;
  onMoveToTeam: (playerId: string, teamNumber: number) => void;
}

export const PlayerTeamMiniCard = ({ 
  player, 
  playerProfiles, 
  currentTeam,
  totalTeams,
  onMoveToTeam 
}: PlayerTeamMiniCardProps) => {
  const playerData = playerProfiles.find(p => p.id === player.id);
  
  const getTeamName = (teamNumber: number) => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    return names[(teamNumber - 1) % names.length];
  };

  return (
    <div className="p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <User className="w-4 h-4 text-gray-400" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800 text-sm truncate">
              {playerData?.full_name || 'Loading...'}
            </div>
            <div className="text-xs text-gray-500">
              Handicap: {playerData?.handicap || 0}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Move className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={() => onMoveToTeam(player.id, 0)}
              className="text-gray-600"
            >
              Remove from team
            </DropdownMenuItem>
            {Array.from({ length: totalTeams }, (_, i) => i + 1)
              .filter(teamNum => teamNum !== currentTeam)
              .map(teamNumber => (
                <DropdownMenuItem
                  key={teamNumber}
                  onClick={() => onMoveToTeam(player.id, teamNumber)}
                >
                  Move to Team {getTeamName(teamNumber)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
