
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreInputDialog } from './ScoreInputDialog';
import { ScoreButton } from './ScoreButton';

interface HoleScore {
  hole: number;
  par: number;
  handicap_rating: number;
  scores: Record<string, number>;
}

interface ScorecardTableProps {
  title: string;
  holeScores: HoleScore[];
  players: any[];
  editingHole: { hole: number; playerId: string } | null;
  setEditingHole: (hole: { hole: number; playerId: string } | null) => void;
  handleScoreChange: (hole: number, playerId: string, value: string) => void;
  getDisplayScore: (playerId: string, hole: HoleScore) => number;
  showTotal?: boolean;
  calculateTotal?: (playerId: string) => number;
}

// Helper function to calculate relative handicap
const getRelativeHandicap = (playerHandicap: number, lowestHandicap: number): number => {
  return playerHandicap - lowestHandicap;
};

// Helper function to calculate strokes received on a hole using relative handicapping
const getStrokesOnHole = (relativeHandicap: number, holeHandicapRating: number): number => {
  const handicap = Math.round(relativeHandicap);
  
  // Only positive relative handicaps get strokes (higher handicap players relative to lowest)
  if (handicap > 0) {
    const strokesPerHole = Math.floor(handicap / 18);
    const extraStrokes = handicap % 18;
    
    let strokes = strokesPerHole;
    
    // Add extra stroke if this hole's handicap rating is within the remainder
    if (extraStrokes >= holeHandicapRating) {
      strokes += 1;
    }
    
    return strokes;
  }
  
  // Players at or below the lowest handicap get no strokes
  return 0;
};

export const ScorecardTable = ({
  title,
  holeScores,
  players,
  editingHole,
  setEditingHole,
  handleScoreChange,
  getDisplayScore,
  showTotal = false,
  calculateTotal
}: ScorecardTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHole, setSelectedHole] = useState<HoleScore | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const holeRange = title === 'Front 9' ? holeScores.slice(0, 9) : holeScores.slice(9, 18);
  const startHole = title === 'Front 9' ? 1 : 10;

  // Calculate the lowest handicap among all players for relative handicapping
  const lowestHandicap = Math.min(...players.map(player => player.profiles.handicap || 0));

  const handleScoreClick = (hole: HoleScore, player: any) => {
    setSelectedHole(hole);
    setSelectedPlayer(player);
    setDialogOpen(true);
  };

  const handleScoreSave = (score: number) => {
    if (selectedHole && selectedPlayer) {
      handleScoreChange(selectedHole.hole, selectedPlayer.profiles.id, score.toString());
    }
    setDialogOpen(false);
    setSelectedHole(null);
    setSelectedPlayer(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedHole(null);
    setSelectedPlayer(null);
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
              {players.map((player) => (
                <tr key={player.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-left">
                    <div className="font-medium">{player.profiles.full_name.split(' ')[0]}</div>
                  </td>
                  {holeRange.map((hole) => {
                    const playerHandicap = player.profiles.handicap || 0;
                    const relativeHandicap = getRelativeHandicap(playerHandicap, lowestHandicap);
                    const receivesStroke = getStrokesOnHole(relativeHandicap, hole.handicap_rating) > 0;
                    
                    return (
                      <td key={hole.hole} className="p-1 text-center">
                        <div className="relative">
                          <ScoreButton
                            score={getDisplayScore(player.profiles.id, hole)}
                            onClick={() => handleScoreClick(hole, player)}
                          />
                          {receivesStroke && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-bold">
                    {holeRange.reduce((sum, h) => sum + (h.scores[player.profiles.id] || 0), 0) || '-'}
                  </td>
                  {showTotal && calculateTotal && (
                    <td className="p-2 text-center font-bold text-primary">
                      {calculateTotal(player.profiles.id) || '-'}
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
        currentScore={selectedHole && selectedPlayer ? selectedHole.scores[selectedPlayer.profiles.id] || 0 : 0}
        parScore={selectedHole?.par || 4}
        playerName={selectedPlayer?.profiles.full_name || ''}
        holeNumber={selectedHole?.hole || 1}
      />
    </Card>
  );
};
