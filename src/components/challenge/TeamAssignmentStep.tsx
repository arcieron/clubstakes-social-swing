import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers } from '@/lib/mockData';

interface Player {
  id: string;
  team?: number;
}

interface TeamAssignmentStepProps {
  user: any;
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const TeamAssignmentStep = ({ user, selectedPlayers, onPlayersChange, onBack, onSubmit }: TeamAssignmentStepProps) => {
  const getTeamOptions = () => {
    const totalPlayers = selectedPlayers.length + 1; // +1 for current user
    const maxTeams = Math.floor(totalPlayers / 2);
    return Array.from({ length: maxTeams }, (_, i) => i + 1);
  };

  const assignPlayerToTeam = (playerId: string, teamNumber: number) => {
    onPlayersChange(
      selectedPlayers.map(p => p.id === playerId ? { ...p, team: teamNumber } : p)
    );
  };

  const teamOptions = getTeamOptions();

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary">Assign Teams</CardTitle>
        <CardDescription>
          Assign players to teams (max {teamOptions.length} teams)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-3">
          {/* Current user */}
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-primary">{user.fullName} (You)</p>
                <p className="text-sm text-gray-500">Handicap: {user.handicap}</p>
              </div>
              <Select defaultValue="1">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map(team => (
                    <SelectItem key={team} value={team.toString()}>Team {team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Other players */}
          {selectedPlayers.map(player => {
            const playerData = mockUsers.find(u => u.id === player.id);
            return (
              <div key={player.id} className="p-3 bg-white border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{playerData?.fullName}</p>
                    <p className="text-sm text-gray-500">Handicap: {playerData?.handicap}</p>
                  </div>
                  <Select 
                    value={player.team?.toString() || ""} 
                    onValueChange={(value) => assignPlayerToTeam(player.id, parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(team => (
                        <SelectItem key={team} value={team.toString()}>Team {team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            Back
          </Button>
          <Button 
            onClick={onSubmit}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Send Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
