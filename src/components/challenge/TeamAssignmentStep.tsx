
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, User, Trophy, Target } from 'lucide-react';

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

interface ProfileData {
  id: string;
  full_name: string;
  handicap: number;
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
  const [playerProfiles, setPlayerProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    fetchPlayerProfiles();
  }, [selectedPlayers]);

  const fetchPlayerProfiles = async () => {
    if (selectedPlayers.length === 0) return;

    const playerIds = selectedPlayers.map(p => p.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, handicap')
        .in('id', playerIds);

      if (error) {
        console.error('Error fetching player profiles:', error);
      } else {
        setPlayerProfiles(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPlayerProfiles:', error);
    }
  };

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
      if (p.id === user.id) return sum + (user.profile?.handicap || 0);
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
            <div key={teamNumber} className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-32">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={teamNumber === 1 ? 'bg-blue-500' : 'bg-red-500'}>
                    Team {teamNumber}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({getTeamPlayers(teamNumber).length} players)
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Avg HC: {getTeamHandicap(teamNumber)}
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Current user */}
                {teamNumber === userTeam && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium text-primary">{user.profile?.full_name || user.email} (You)</p>
                          <p className="text-xs text-gray-500">Handicap: {user.profile?.handicap || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2].slice(0, maxTeams).map(team => (
                          <Button
                            key={team}
                            variant={userTeam === team ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUserTeam(team)}
                            className="w-8 h-8 p-0 text-xs"
                          >
                            {team}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Team players */}
                {selectedPlayers
                  .filter(p => p.team === teamNumber)
                  .map(player => {
                    const playerData = playerProfiles.find(u => u.id === player.id);
                    return (
                      <div key={player.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-800">{playerData?.full_name || 'Loading...'}</p>
                              <p className="text-xs text-gray-500">Handicap: {playerData?.handicap || 0}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2].slice(0, maxTeams).map(team => (
                              <Button
                                key={team}
                                variant={player.team === team ? "default" : "outline"}
                                size="sm"
                                onClick={() => assignPlayerToTeam(player.id, team)}
                                className="w-8 h-8 p-0 text-xs"
                              >
                                {team}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned players */}
        {unassignedPlayers.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Unassigned Players ({unassignedPlayers.length})
            </h4>
            <div className="space-y-2">
              {unassignedPlayers.map(player => {
                const playerData = playerProfiles.find(u => u.id === player.id);
                return (
                  <div key={player.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-800">{playerData?.full_name || 'Loading...'}</p>
                          <p className="text-xs text-gray-500">Handicap: {playerData?.handicap || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2].slice(0, maxTeams).map(team => (
                          <Button
                            key={team}
                            variant="outline"
                            size="sm"
                            onClick={() => assignPlayerToTeam(player.id, team)}
                            className="w-8 h-8 p-0 text-xs"
                          >
                            {team}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
