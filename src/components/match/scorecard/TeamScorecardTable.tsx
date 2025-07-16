
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreInputDialog } from './ScoreInputDialog';
import { ScoreButton } from './ScoreButton';
import { Badge } from '@/components/ui/badge';

interface HoleScore {
  hole: number;
  par: number;
  handicap_rating: number;
  scores: Record<string, number>;
}

interface TeamScorecardTableProps {
  title: string;
  holeScores: HoleScore[];
  players: any[];
  match: any;
  editingHole: { hole: number; playerId: string } | null;
  setEditingHole: (hole: { hole: number; playerId: string } | null) => void;
  handleScoreChange: (hole: number, playerId: string, value: string) => void;
  getDisplayScore: (playerId: string, hole: HoleScore) => number;
  showTotal?: boolean;
  calculateTotal?: (playerId: string) => number;
}

export const TeamScorecardTable = ({
  title,
  holeScores,
  players,
  match,
  editingHole,
  setEditingHole,
  handleScoreChange,
  getDisplayScore,
  showTotal = false,
  calculateTotal
}: TeamScorecardTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHole, setSelectedHole] = useState<HoleScore | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const holeRange = title === 'Front 9' ? holeScores.slice(0, 9) : holeScores.slice(9, 18);
  const startHole = title === 'Front 9' ? 1 : 10;

  // Group players by team
  const teams = players.reduce((acc, player) => {
    const teamNumber = player.team_number || 1;
    if (!acc[teamNumber]) {
      acc[teamNumber] = [];
    }
    acc[teamNumber].push(player);
    return acc;
  }, {} as Record<number, any[]>);

  const teamNumbers = Object.keys(teams).map(Number).sort();

  const getTeamName = (teamNumber: number) => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    return names[(teamNumber - 1) % names.length];
  };

  const getTeamColor = (teamNumber: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-red-100 text-red-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    return colors[(teamNumber - 1) % colors.length];
  };

  // For scramble, we use a virtual team ID to store the team score
  const getTeamScoreId = (teamNumber: number) => `team_${teamNumber}`;

  const getTeamScore = (hole: HoleScore, teamNumber: number) => {
    const teamScoreId = getTeamScoreId(teamNumber);
    return hole.scores[teamScoreId] || 0;
  };

  const handleTeamScoreClick = (hole: HoleScore, teamNumber: number) => {
    setSelectedHole(hole);
    setSelectedTeam(teamNumber);
    setDialogOpen(true);
  };

  const handleScoreSave = (score: number) => {
    if (selectedHole && selectedTeam) {
      const teamScoreId = getTeamScoreId(selectedTeam);
      handleScoreChange(selectedHole.hole, teamScoreId, score.toString());
    }
    setDialogOpen(false);
    setSelectedHole(null);
    setSelectedTeam(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedHole(null);
    setSelectedTeam(null);
  };

  const calculateTeamTotal = (teamNumber: number) => {
    const teamScoreId = getTeamScoreId(teamNumber);
    return holeScores.reduce((total, hole) => total + (hole.scores[teamScoreId] || 0), 0);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Hole</th>
                {Array.from({ length: 9 }, (_, i) => (
                  <th key={startHole + i} className="p-1 text-center min-w-[50px]">
                    {startHole + i}
                  </th>
                ))}
                <th className="p-2 text-center font-bold">
                  {title === 'Front 9' ? 'OUT' : 'IN'}
                </th>
                {showTotal && (
                  <th className="p-2 text-center font-bold">TOT</th>
                )}
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-2 text-left font-medium">Par</td>
                {holeRange.map((hole) => (
                  <td key={hole.hole} className="p-1 text-center">{hole.par}</td>
                ))}
                <td className="p-2 text-center font-bold">
                  {holeRange.reduce((sum, h) => sum + h.par, 0)}
                </td>
                {showTotal && (
                  <td className="p-2 text-center font-bold">
                    {holeScores.reduce((sum, h) => sum + h.par, 0)}
                  </td>
                )}
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-2 text-left font-medium text-xs">HCP</td>
                {holeRange.map((hole) => (
                  <td key={hole.hole} className="p-1 text-center text-xs">{hole.handicap_rating}</td>
                ))}
                <td className="p-2 text-center"></td>
                {showTotal && <td className="p-2 text-center"></td>}
              </tr>
            </thead>
            <tbody>
              {teamNumbers.map((teamNumber) => (
                <tr key={teamNumber} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-left">
                    <div className="flex items-center gap-2">
                      <Badge className={getTeamColor(teamNumber)} variant="secondary">
                        Team {getTeamName(teamNumber)}
                      </Badge>
                    </div>
                  </td>
                  {holeRange.map((hole) => (
                    <td key={hole.hole} className="p-1 text-center">
                      <ScoreButton
                        score={getTeamScore(hole, teamNumber)}
                        onClick={() => handleTeamScoreClick(hole, teamNumber)}
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center font-bold">
                    {holeRange.reduce((sum, h) => sum + getTeamScore(h, teamNumber), 0) || '-'}
                  </td>
                  {showTotal && (
                    <td className="p-2 text-center font-bold text-primary">
                      {calculateTeamTotal(teamNumber) || '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <ScoreInputDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleScoreSave}
        currentScore={selectedHole && selectedTeam ? getTeamScore(selectedHole, selectedTeam) : 0}
        parScore={selectedHole?.par || 4}
        playerName={selectedTeam ? `Team ${getTeamName(selectedTeam)}` : ''}
        holeNumber={selectedHole?.hole || 1}
      />
    </Card>
  );
};
