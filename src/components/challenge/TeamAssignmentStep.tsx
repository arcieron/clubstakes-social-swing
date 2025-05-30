
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Plus, Minus } from 'lucide-react';
import { usePlayerProfiles } from '@/hooks/usePlayerProfiles';
import { TeamSectionCard } from './TeamSectionCard';
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
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const { playerProfiles } = usePlayerProfiles(selectedPlayers);

  console.log('TeamAssignmentStep rendering with:', {
    userTeam,
    numberOfTeams,
    selectedPlayers: selectedPlayers.length,
    challengeData
  });

  const totalPlayers = selectedPlayers.length + 1;
  const maxPossibleTeams = Math.min(totalPlayers, 6); // Maximum 6 teams
  
  const assignPlayerToTeam = (playerId: string, teamNumber: number) => {
    console.log('Assigning player', playerId, 'to team', teamNumber);
    onPlayersChange(
      selectedPlayers.map(p => p.id === playerId ? { ...p, team: teamNumber } : p)
    );
  };

  const movePlayerToTeam = (playerId: string, newTeamNumber: number) => {
    assignPlayerToTeam(playerId, newTeamNumber);
  };

  const addTeam = () => {
    if (numberOfTeams < maxPossibleTeams) {
      console.log('Adding team, new count:', numberOfTeams + 1);
      setNumberOfTeams(numberOfTeams + 1);
    }
  };

  const removeTeam = () => {
    if (numberOfTeams > 2) {
      console.log('Removing team, new count:', numberOfTeams - 1);
      // Move any players from the last team to unassigned
      const playersInLastTeam = selectedPlayers.filter(p => p.team === numberOfTeams);
      playersInLastTeam.forEach(player => {
        assignPlayerToTeam(player.id, 0); // 0 means unassigned
      });
      
      // If user was in the last team, move them to team 1
      if (userTeam === numberOfTeams) {
        setUserTeam(1);
      }
      
      setNumberOfTeams(numberOfTeams - 1);
    }
  };

  // Auto-balance teams
  const autoAssignTeams = () => {
    console.log('Auto-assigning teams');
    const updatedPlayers = selectedPlayers.map((player, index) => ({
      ...player,
      team: (index % numberOfTeams) + 1
    }));
    onPlayersChange(updatedPlayers);
    setUserTeam(1);
  };

  // Get players by team (excluding the current user)
  const getTeamPlayers = (teamNumber: number) => {
    return selectedPlayers.filter(p => p.team === teamNumber);
  };

  // Calculate team handicap including user if they're on this team
  const getTeamHandicap = (teamNumber: number) => {
    const teamPlayers = getTeamPlayers(teamNumber);
    const allPlayersInTeam = teamNumber === userTeam ? [user, ...teamPlayers] : teamPlayers;
    
    if (allPlayersInTeam.length === 0) return 0;
    
    const totalHandicap = allPlayersInTeam.reduce((sum, p) => {
      if (p.id === user.id) return sum + (user.handicap || 0);
      const playerData = playerProfiles.find(u => u.id === p.id);
      return sum + (playerData?.handicap || 0);
    }, 0);
    return Math.round(totalHandicap / allPlayersInTeam.length);
  };

  const unassignedPlayers = selectedPlayers.filter(p => !p.team || p.team === 0);

  console.log('Team assignment state:', {
    unassignedPlayers: unassignedPlayers.length,
    teamCounts: Array.from({ length: numberOfTeams }, (_, i) => ({
      team: i + 1,
      players: getTeamPlayers(i + 1).length + (userTeam === i + 1 ? 1 : 0)
    }))
  });

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Assign Teams
        </CardTitle>
        <CardDescription>
          Organize {totalPlayers} players into {numberOfTeams} teams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Team controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={removeTeam}
              disabled={numberOfTeams <= 2}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">{numberOfTeams} Teams</span>
            <Button
              variant="outline"
              size="sm"
              onClick={addTeam}
              disabled={numberOfTeams >= maxPossibleTeams}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Team sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map(teamNumber => (
            <TeamSectionCard
              key={teamNumber}
              teamNumber={teamNumber}
              user={user}
              userTeam={userTeam}
              onUserTeamChange={setUserTeam}
              teamPlayers={getTeamPlayers(teamNumber)}
              playerProfiles={playerProfiles}
              unassignedPlayers={unassignedPlayers}
              onMovePlayerToTeam={movePlayerToTeam}
              getTeamHandicap={getTeamHandicap}
              totalTeams={numberOfTeams}
            />
          ))}
        </div>

        {/* Unassigned players */}
        {unassignedPlayers.length > 0 && (
          <UnassignedPlayersSection
            unassignedPlayers={unassignedPlayers}
            playerProfiles={playerProfiles}
            maxTeams={numberOfTeams}
            onAssignToTeam={assignPlayerToTeam}
          />
        )}

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
