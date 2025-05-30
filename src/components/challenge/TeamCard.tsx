
import { Badge } from '@/components/ui/badge';
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

interface TeamCardProps {
  teamNumber: number;
  maxTeams: number;
  user: any;
  userTeam: number;
  selectedPlayers: Player[];
  playerProfiles: ProfileData[];
  onAssignToTeam: (playerId: string, teamNumber: number) => void;
  onUserTeamChange: (teamNumber: number) => void;
  getTeamHandicap: (teamNumber: number) => number;
  getTeamPlayers: (teamNumber: number) => any[];
}

export const TeamCard = ({
  teamNumber,
  maxTeams,
  user,
  userTeam,
  selectedPlayers,
  playerProfiles,
  onAssignToTeam,
  onUserTeamChange,
  getTeamHandicap,
  getTeamPlayers
}: TeamCardProps) => {
  const teamPlayers = getTeamPlayers(teamNumber);
  
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-32">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={teamNumber === 1 ? 'bg-blue-500' : 'bg-red-500'}>
            Team {teamNumber}
          </Badge>
          <span className="text-sm text-gray-500">
            ({teamPlayers.length} players)
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Avg HC: {getTeamHandicap(teamNumber)}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Current user */}
        {teamNumber === userTeam && (
          <PlayerTeamCard
            player={{ id: user.id, team: userTeam }}
            playerProfiles={playerProfiles}
            maxTeams={maxTeams}
            onAssignToTeam={onUserTeamChange}
            isUser={true}
            userName={user.full_name || user.email}
            userHandicap={user.handicap || 0}
          />
        )}
        
        {/* Team players */}
        {selectedPlayers
          .filter(p => p.team === teamNumber)
          .map(player => (
            <PlayerTeamCard
              key={player.id}
              player={player}
              playerProfiles={playerProfiles}
              maxTeams={maxTeams}
              onAssignToTeam={onAssignToTeam}
            />
          ))}
      </div>
    </div>
  );
};
