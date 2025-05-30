
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { User, Crown } from 'lucide-react';
import { PlayerTeamMiniCard } from './PlayerTeamMiniCard';

interface Player {
  id: string;
  team?: number;
}

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
}

interface TeamSectionCardProps {
  teamNumber: number;
  user: any;
  userTeam: number;
  onUserTeamChange: (teamNumber: number) => void;
  teamPlayers: Player[];
  playerProfiles: ProfileData[];
  unassignedPlayers: Player[];
  onMovePlayerToTeam: (playerId: string, teamNumber: number) => void;
  getTeamHandicap: (teamNumber: number) => number;
  totalTeams: number;
}

export const TeamSectionCard = ({
  teamNumber,
  user,
  userTeam,
  onUserTeamChange,
  teamPlayers,
  playerProfiles,
  unassignedPlayers,
  onMovePlayerToTeam,
  getTeamHandicap,
  totalTeams
}: TeamSectionCardProps) => {
  const isUserInThisTeam = userTeam === teamNumber;
  const totalPlayersInTeam = teamPlayers.length + (isUserInThisTeam ? 1 : 0);
  
  const getTeamColor = (teamNumber: number) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-red-500 text-white', 
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-pink-500 text-white'
    ];
    return colors[(teamNumber - 1) % colors.length];
  };

  const getTeamName = (teamNumber: number) => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    return names[(teamNumber - 1) % names.length];
  };

  return (
    <Card className="min-h-48 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={getTeamColor(teamNumber)}>
            Team {getTeamName(teamNumber)}
          </Badge>
          <div className="text-xs text-gray-500">
            {totalPlayersInTeam} player{totalPlayersInTeam !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Avg Handicap: {getTeamHandicap(teamNumber)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 pt-0">
        {/* Current user */}
        {isUserInThisTeam && (
          <div className="p-2 bg-primary/10 rounded border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <div>
                  <div className="font-medium text-primary text-sm">
                    {user.full_name || user.email} (You)
                  </div>
                  <div className="text-xs text-gray-500">Handicap: {user.handicap || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team members */}
        {teamPlayers.map(player => (
          <PlayerTeamMiniCard
            key={player.id}
            player={player}
            playerProfiles={playerProfiles}
            currentTeam={teamNumber}
            totalTeams={totalTeams}
            onMoveToTeam={onMovePlayerToTeam}
          />
        ))}

        {/* Add user to team button */}
        {!isUserInThisTeam && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUserTeamChange(teamNumber)}
            className="w-full border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 text-gray-500 hover:text-primary"
          >
            <User className="w-4 h-4 mr-2" />
            Join this team
          </Button>
        )}

        {/* Add players from unassigned */}
        {unassignedPlayers.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Add players:</div>
            <div className="space-y-1">
              {unassignedPlayers.slice(0, 3).map(player => {
                const playerData = playerProfiles.find(p => p.id === player.id);
                return (
                  <Button
                    key={player.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onMovePlayerToTeam(player.id, teamNumber)}
                    className="w-full justify-start text-xs hover:bg-gray-50"
                  >
                    <User className="w-3 h-3 mr-2" />
                    {playerData?.full_name || 'Loading...'}
                  </Button>
                );
              })}
              {unassignedPlayers.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{unassignedPlayers.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
