
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CompletedScorecardProps {
  match: any;
  players: any[];
  holeScores: any[];
}

export const CompletedScorecard = ({ match, players, holeScores }: CompletedScorecardProps) => {
  // Create hole scores matrix
  const createHoleScoresMatrix = () => {
    const matrix: Record<string, Record<number, number>> = {};
    
    // Initialize matrix
    players.forEach(player => {
      matrix[player.profiles.id] = {};
      for (let i = 1; i <= 18; i++) {
        matrix[player.profiles.id][i] = 0;
      }
    });

    // Fill in actual scores
    holeScores.forEach(score => {
      if (matrix[score.player_id]) {
        matrix[score.player_id][score.hole_number] = score.score || 0;
      }
    });

    return matrix;
  };

  const scoresMatrix = createHoleScoresMatrix();

  // Standard par for 18 holes (fallback if no course data)
  const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];

  const calculateTotal = (playerId: string, startHole: number = 1, endHole: number = 18) => {
    let total = 0;
    for (let hole = startHole; hole <= endHole; hole++) {
      total += scoresMatrix[playerId]?.[hole] || 0;
    }
    return total;
  };

  const calculateToPar = (playerId: string) => {
    const total = calculateTotal(playerId);
    const totalPar = standardPars.reduce((sum, par) => sum + par, 0);
    const toPar = total - totalPar;
    return toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : toPar.toString();
  };

  const ScorecardTable = ({ title, startHole, endHole, showTotal = false }: { 
    title: string; 
    startHole: number; 
    endHole: number; 
    showTotal?: boolean; 
  }) => (
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
                {Array.from({ length: endHole - startHole + 1 }, (_, i) => (
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
                {Array.from({ length: endHole - startHole + 1 }, (_, i) => (
                  <td key={startHole + i} className="p-1 text-center">
                    {standardPars[startHole + i - 1]}
                  </td>
                ))}
                <td className="p-2 text-center font-bold">
                  {standardPars.slice(startHole - 1, endHole).reduce((sum, par) => sum + par, 0)}
                </td>
                {showTotal && (
                  <td className="p-2 text-center font-bold">
                    {standardPars.reduce((sum, par) => sum + par, 0)}
                  </td>
                )}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.profiles.full_name.split(' ')[0]}</span>
                      {match.winner_id === player.profiles.id && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          Winner
                        </Badge>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: endHole - startHole + 1 }, (_, i) => {
                    const hole = startHole + i;
                    const score = scoresMatrix[player.profiles.id]?.[hole] || 0;
                    const par = standardPars[hole - 1];
                    
                    return (
                      <td key={hole} className="p-1 text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto ${
                          score === 0 ? 'bg-gray-100 text-gray-400' :
                          score < par ? 'bg-red-100 text-red-800' :
                          score === par ? 'bg-gray-100 text-gray-800' :
                          score === par + 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {score || '-'}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-bold">
                    {calculateTotal(player.profiles.id, startHole, endHole) || '-'}
                  </td>
                  {showTotal && (
                    <td className="p-2 text-center font-bold text-primary">
                      <div>
                        <div>{calculateTotal(player.profiles.id) || '-'}</div>
                        <div className="text-xs text-gray-500">
                          {calculateToPar(player.profiles.id)}
                        </div>
                      </div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Final Scorecard</h3>
        <Badge variant="outline" className="text-xs">
          {match.format === 'stroke-play' ? 'Gross Scoring' : 'Net Scoring'}
        </Badge>
      </div>

      <ScorecardTable title="Front 9" startHole={1} endHole={9} />
      <ScorecardTable title="Back 9" startHole={10} endHole={18} showTotal={true} />
    </div>
  );
};
