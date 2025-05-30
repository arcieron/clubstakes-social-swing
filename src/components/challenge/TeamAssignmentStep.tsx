
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target } from 'lucide-react';
import { usePlayerProfiles } from '@/hooks/usePlayerProfiles';
import { TeamCard } from './TeamCard';
import { UnassignedPlayersSection } from './UnassignedPlayersSection';

interface Player {
  id: string;
  team?: number;
}

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
}

interface TeamAssignmentStepProps {
  user: any;
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
  challengeData: ChallengeData;
  onBack: () => void;
  onSubmit: () => void;
}

export const TeamAssignmentStep = ({ 
  user, 
  selectedPlayers, 
  onPlayersChange, 
  challengeData,
  onBack, 
  onSubmit 
}: TeamAssignmentStepProps) => {
  const [userTeam, setUserTeam] = useState(1);
  const { playerProfiles } = usePlayerProfiles(selectedPlayers);

  const totalPlayers = selectedPlayers.length + 1;
  const maxTeams = Math.min(Math.floor(totalPlayers / 2), 4);
  
  const assignPlayerToTeam = (playerId: string, teamNumber: number) => {
    onPlayersChange(
      selectedPlayers.map(p => p.id === playerId ? { ...p, team: teamNumber } : p)
    );
  };

  // Auto-balance teams
  const autoAssignTeams = () => {
    const updatedPlayers = selectedPlayers.map((player, index) => ({
      ...player,
      team: (index % 2) + 1
    }));
    onPlayersChange(updatedPlayers);
    setUserTeam(1);
  };

  // Get players by team
  const getTeamPlayers = (teamNumber: number) => {
    const teamPlayers = selectedPlayers.filter(p => p.team === teamNumber);
    if (teamNumber === userTeam) {
      return [user, ...teamPlayers];
    }
    return teamPlayers;
  };

  // Calculate team handicap
  const getTeamHandicap = (teamNumber: number) => {
    const players = getTeamPlayers(teamNumber);
    if (players.length === 0) return 0;
    const totalHandicap = players.reduce((sum, p) => {
      if (p.id === user.id) return sum + (user.handicap || 0);
      const playerData = playerProfiles.find(u => u.id === p.id);
      return sum + (playerData?.handicap || 0);
    }, 0);
    return Math.round(totalHandicap / players.length);
  };

  const unassignedPlayers = selectedPlayers.filter(p => !p.team);

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Assign Teams
        </CardTitle>
        <CardDescription>
          Organize {totalPlayers} players into balanced teams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Auto-assign button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Manually assign players or auto-balance teams</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={autoAssignTeams}
            className="text-primary border-primary hover:bg-primary/10"
          >
            <Target className="w-4 h-4 mr-2" />
            Auto Balance
          </Button>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].slice(0, maxTeams).map(teamNumber => (
            <TeamCard
              key={teamNumber}
              teamNumber={teamNumber}
              maxTeams={maxTeams}
              user={user}
              userTeam={userTeam}
              selectedPlayers={selectedPlayers}
              playerProfiles={playerProfiles}
              onAssignToTeam={assignPlayerToTeam}
              onUserTeamChange={setUserTeam}
              getTeamHandicap={getTeamHandicap}
              getTeamPlayers={getTeamPlayers}
            />
          ))}
        </div>

        {/* Unassigned players */}
        <UnassignedPlayersSection
          unassignedPlayers={unassignedPlayers}
          playerProfiles={playerProfiles}
          maxTeams={maxTeams}
          onAssignToTeam={assignPlayerToTeam}
        />

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
            disabled={unassignedPlayers.length > 0}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Send Challenge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
