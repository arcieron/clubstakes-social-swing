
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreInput } from './ScoreInput';
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
  editingHole: number | null;
  setEditingHole: (hole: number | null) => void;
  handleScoreChange: (hole: number, playerId: string, value: string) => void;
  getDisplayScore: (playerId: string, hole: HoleScore) => number;
  showTotal?: boolean;
  calculateTotal?: (playerId: string) => number;
}

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
  const holeRange = title === 'Front 9' ? holeScores.slice(0, 9) : holeScores.slice(9, 18);
  const startHole = title === 'Front 9' ? 1 : 10;

  const getEditingKey = (hole: number, playerId: string) => `${hole}-${playerId}`;

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
                    const editingKey = getEditingKey(hole.hole, player.profiles.id);
                    const isEditing = editingHole === parseInt(editingKey.split('-')[0]) && editingKey.includes(player.profiles.id);
                    
                    return (
                      <td key={hole.hole} className="p-1 text-center">
                        {isEditing ? (
                          <ScoreInput
                            value={hole.scores[player.profiles.id] || 0}
                            onChange={(value) => handleScoreChange(hole.hole, player.profiles.id, value)}
                            onBlur={() => setEditingHole(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingHole(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingHole(null);
                              }
                            }}
                          />
                        ) : (
                          <ScoreButton
                            score={getDisplayScore(player.profiles.id, hole)}
                            onClick={() => setEditingHole(hole.hole)}
                          />
                        )}
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
    </Card>
  );
};
