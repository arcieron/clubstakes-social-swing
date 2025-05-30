
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

interface ChallengeData {
  teamFormat: string;
  postToFeed: boolean;
}

interface ProfileData {
  id: string;
  full_name: string;
  id_number: number;
  handicap: number;
  credits: number;
  club_id: string;
}

interface SelectedPlayersDisplayProps {
  user: any;
  selectedPlayers: Player[];
  challengeData: ChallengeData;
  clubMembers: ProfileData[];
  onPlayerRemove: (playerId: string) => void;
  onPlayerTeamChange?: (playerId: string, teamNumber: number) => void;
  onAddOpenSpot?: () => void;
  openSpots?: number;
}

export const SelectedPlayersDisplay = ({ 
  user, 
  selectedPlayers, 
  challengeData, 
  clubMembers, 
  onPlayerRemove,
  onPlayerTeamChange,
  onAddOpenSpot,
  openSpots = 0
}: SelectedPlayersDisplayProps) => {
  const totalPlayers = selectedPlayers.length + 1 + openSpots;

  const getTeamColor = (teamNumber: number) => {
    const colors = {
      1: 'bg-blue-500 text-white',
      2: 'bg-red-500 text-white',
      3: 'bg-green-500 text-white',
      4: 'bg-purple-500 text-white',
    };
    return colors[teamNumber as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-primary/5 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-primary">Match Participants</p>
        <Badge variant="secondary">{totalPlayers} players</Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Current user - always Team 1 for team format */}
        <Badge className={challengeData.teamFormat === 'teams' ? getTeamColor(1) : 'bg-primary text-white'}>
          {user.full_name || user.email} (You)
          {challengeData.teamFormat === 'teams' && ' - Team 1'}
        </Badge>

        {selectedPlayers.map((player) => {
          const playerData = clubMembers.find(u => u.id === player.id);
          const teamDisplay = challengeData.teamFormat === 'teams' && player.team ? ` - Team ${player.team}` : '';
          
          return (
            <div key={player.id} className="flex items-center gap-1">
              {challengeData.teamFormat === 'teams' && onPlayerTeamChange ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={`cursor-pointer hover:bg-gray-50 ${player.team ? getTeamColor(player.team) : 'border-dashed'}`}
                    >
                      {playerData?.full_name || 'Unknown Player'}{teamDisplay || ' - No Team'}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border shadow-md">
                    <DropdownMenuItem onClick={() => onPlayerTeamChange(player.id, 1)}>
                      Team 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPlayerTeamChange(player.id, 2)}>
                      Team 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPlayerTeamChange(player.id, 3)}>
                      Team 3
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPlayerTeamChange(player.id, 4)}>
                      Team 4
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  {playerData?.full_name || 'Unknown Player'}{teamDisplay}
                </Badge>
              )}
              <button
                onClick={() => onPlayerRemove(player.id)}
                className="text-gray-500 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </div>
          );
        })}

        {/* Open spots */}
        {Array.from({ length: openSpots }, (_, index) => (
          <Badge key={`open-spot-${index}`} variant="outline" className="border-dashed border-blue-300 text-blue-600">
            Open Spot
          </Badge>
        ))}
      </div>
      
      {challengeData.postToFeed && onAddOpenSpot && (
        <Button 
          variant="outline" 
          onClick={onAddOpenSpot}
          className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Open Spot for Club Members
        </Button>
      )}
    </div>
  );
};
