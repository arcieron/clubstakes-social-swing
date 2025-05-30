
import { Users } from 'lucide-react';
import { PlayerTeamCard } from './PlayerTeamCard';

interface Player {
  id: string;
  team?: number;
}

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
}

interface UnassignedPlayersSectionProps {
  unassignedPlayers: Player[];
  playerProfiles: ProfileData[];
  maxTeams: number;
  onAssignToTeam: (playerId: string, teamNumber: number) => void;
}

export const UnassignedPlayersSection = ({
  unassignedPlayers,
  playerProfiles,
  maxTeams,
  onAssignToTeam
}: UnassignedPlayersSectionProps) => {
  if (unassignedPlayers.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Unassigned Players ({unassignedPlayers.length})
      </h4>
      <div className="space-y-2">
        {unassignedPlayers.map(player => (
          <div key={player.id} className="bg-yellow-50 border border-yellow-200 rounded-lg">
            <PlayerTeamCard
              player={player}
              playerProfiles={playerProfiles}
              maxTeams={maxTeams}
              onAssignToTeam={onAssignToTeam}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
