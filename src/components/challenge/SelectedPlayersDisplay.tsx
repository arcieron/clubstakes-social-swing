
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  onAddOpenSpot?: () => void;
  openSpots?: number;
}

export const SelectedPlayersDisplay = ({ 
  user, 
  selectedPlayers, 
  challengeData, 
  clubMembers, 
  onPlayerRemove,
  onAddOpenSpot,
  openSpots = 0
}: SelectedPlayersDisplayProps) => {
  const totalPlayers = selectedPlayers.length + 1 + openSpots;

  return (
    <div className="bg-primary/5 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-primary">Match Participants</p>
        <Badge variant="secondary">{totalPlayers} players</Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className="bg-primary text-white">
          {user.full_name || user.email} (You)
          {challengeData.teamFormat === 'teams' && ' - Team 1'}
        </Badge>
        {selectedPlayers.map((player, index) => {
          const playerData = clubMembers.find(u => u.id === player.id);
          return (
            <Badge key={player.id} variant="outline" className="flex items-center gap-1">
              {playerData?.full_name || 'Unknown Player'}
              {challengeData.teamFormat === 'teams' && ` - Team ${Math.floor(index / 2) + (index % 2 === 0 ? 1 : 2)}`}
              <button
                onClick={() => onPlayerRemove(player.id)}
                className="text-gray-500 hover:text-red-500 ml-1"
              >
                ×
              </button>
            </Badge>
          );
        })}
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
