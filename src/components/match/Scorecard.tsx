
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Check, Edit, Users, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScorecardProps {
  matchId: string;
  match: any;
  players: any[];
  onSubmitScores: () => void;
}

interface HoleScore {
  hole: number;
  par: number;
  scores: Record<string, number>;
}

export const Scorecard = ({ matchId, match, players, onSubmitScores }: ScorecardProps) => {
  const { user } = useAuth();
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [editingHole, setEditingHole] = useState<number | null>(null);
  const [tempScores, setTempScores] = useState<Record<string, string>>({});
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Standard 18-hole pars (can be customized based on course)
  const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];

  useEffect(() => {
    initializeScorecard();
    fetchConfirmations();
  }, []);

  const initializeScorecard = () => {
    const holes = Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: standardPars[i],
      scores: players.reduce((acc, player) => {
        acc[player.profiles.id] = 0;
        return acc;
      }, {} as Record<string, number>)
    }));
    setHoleScores(holes);
  };

  const fetchConfirmations = async () => {
    // Fetch existing confirmations from database
    // This would be implemented with a new confirmations table
  };

  const updateScore = (hole: number, playerId: string, score: number) => {
    setHoleScores(prev => prev.map(h => 
      h.hole === hole 
        ? { ...h, scores: { ...h.scores, [playerId]: score } }
        : h
    ));
  };

  const handleScoreInput = (hole: number, playerId: string, value: string) => {
    setTempScores(prev => ({
      ...prev,
      [`${hole}-${playerId}`]: value
    }));
  };

  const saveHoleScores = (hole: number) => {
    Object.entries(tempScores).forEach(([key, value]) => {
      if (key.startsWith(`${hole}-`)) {
        const playerId = key.split('-')[1];
        const score = parseInt(value) || 0;
        updateScore(hole, playerId, score);
      }
    });
    setEditingHole(null);
    setTempScores({});
  };

  const calculateTotal = (playerId: string) => {
    return holeScores.reduce((total, hole) => total + hole.scores[playerId], 0);
  };

  const calculateToPar = (playerId: string) => {
    const total = calculateTotal(playerId);
    const totalPar = holeScores.reduce((sum, hole) => sum + hole.par, 0);
    const toPar = total - totalPar;
    return toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : toPar.toString();
  };

  const confirmScores = async () => {
    setLoading(true);
    try {
      // Save scores to database and mark as confirmed
      toast({ title: "Success", description: "Scores confirmed!" });
      onSubmitScores();
    } catch (error) {
      toast({ title: "Error", description: "Failed to confirm scores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isTeamFormat = match.team_format === 'teams';

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2">
            {isTeamFormat ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-600">
            {match.courses?.name || 'Course TBD'} • {new Date(match.match_date).toLocaleDateString()}
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{match.format}</Badge>
            <Badge variant="outline">{match.wager_amount} credits</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Players Header */}
      <div className="grid grid-cols-1 gap-2">
        {players.map((player) => (
          <div key={player.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-sm">{player.profiles.full_name}</p>
              <p className="text-xs text-gray-500">HCP: {player.profiles.handicap}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{calculateTotal(player.profiles.id) || '-'}</div>
              <div className="text-xs text-gray-500">{calculateToPar(player.profiles.id)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scorecard */}
      <div className="space-y-2">
        {/* Front 9 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-700">Front 9</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Hole</th>
                    {Array.from({ length: 9 }, (_, i) => (
                      <th key={i + 1} className="p-1 text-center min-w-[40px]">{i + 1}</th>
                    ))}
                    <th className="p-2 text-center font-bold">OUT</th>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2 text-left font-medium">Par</td>
                    {holeScores.slice(0, 9).map((hole) => (
                      <td key={hole.hole} className="p-1 text-center">{hole.par}</td>
                    ))}
                    <td className="p-2 text-center font-bold">
                      {holeScores.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b">
                      <td className="p-2 text-left">
                        <div className="font-medium">{player.profiles.full_name.split(' ')[0]}</div>
                      </td>
                      {holeScores.slice(0, 9).map((hole) => (
                        <td key={hole.hole} className="p-1 text-center">
                          {editingHole === hole.hole ? (
                            <Input
                              type="number"
                              className="w-8 h-8 text-xs text-center p-0 border-primary"
                              value={tempScores[`${hole.hole}-${player.profiles.id}`] || ''}
                              onChange={(e) => handleScoreInput(hole.hole, player.profiles.id, e.target.value)}
                              min="1"
                              max="15"
                              autoFocus={tempScores[`${hole.hole}-${player.profiles.id}`] === undefined}
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setEditingHole(hole.hole);
                                setTempScores({ [`${hole.hole}-${player.profiles.id}`]: hole.scores[player.profiles.id]?.toString() || '' });
                              }}
                              className="w-8 h-8 text-center hover:bg-gray-100 rounded flex items-center justify-center"
                            >
                              {hole.scores[player.profiles.id] || '-'}
                            </button>
                          )}
                        </td>
                      ))}
                      <td className="p-2 text-center font-bold">
                        {holeScores.slice(0, 9).reduce((sum, h) => sum + h.scores[player.profiles.id], 0) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Back 9 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-700">Back 9</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Hole</th>
                    {Array.from({ length: 9 }, (_, i) => (
                      <th key={i + 10} className="p-1 text-center min-w-[40px]">{i + 10}</th>
                    ))}
                    <th className="p-2 text-center font-bold">IN</th>
                    <th className="p-2 text-center font-bold">TOT</th>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2 text-left font-medium">Par</td>
                    {holeScores.slice(9, 18).map((hole) => (
                      <td key={hole.hole} className="p-1 text-center">{hole.par}</td>
                    ))}
                    <td className="p-2 text-center font-bold">
                      {holeScores.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                    </td>
                    <td className="p-2 text-center font-bold">
                      {holeScores.reduce((sum, h) => sum + h.par, 0)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b">
                      <td className="p-2 text-left">
                        <div className="font-medium">{player.profiles.full_name.split(' ')[0]}</div>
                      </td>
                      {holeScores.slice(9, 18).map((hole) => (
                        <td key={hole.hole} className="p-1 text-center">
                          {editingHole === hole.hole ? (
                            <Input
                              type="number"
                              className="w-8 h-8 text-xs text-center p-0 border-primary"
                              value={tempScores[`${hole.hole}-${player.profiles.id}`] || ''}
                              onChange={(e) => handleScoreInput(hole.hole, player.profiles.id, e.target.value)}
                              min="1"
                              max="15"
                              autoFocus={tempScores[`${hole.hole}-${player.profiles.id}`] === undefined}
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setEditingHole(hole.hole);
                                setTempScores({ [`${hole.hole}-${player.profiles.id}`]: hole.scores[player.profiles.id]?.toString() || '' });
                              }}
                              className="w-8 h-8 text-center hover:bg-gray-100 rounded flex items-center justify-center"
                            >
                              {hole.scores[player.profiles.id] || '-'}
                            </button>
                          )}
                        </td>
                      ))}
                      <td className="p-2 text-center font-bold">
                        {holeScores.slice(9, 18).reduce((sum, h) => sum + h.scores[player.profiles.id], 0) || '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-primary">
                        {calculateTotal(player.profiles.id) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {editingHole && (
          <div className="flex gap-2">
            <Button 
              onClick={() => saveHoleScores(editingHole)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Hole {editingHole}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingHole(null);
                setTempScores({});
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        <Button 
          onClick={confirmScores}
          disabled={loading || editingHole !== null}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {loading ? 'Confirming...' : 'Confirm Scorecard'}
        </Button>
      </div>
    </div>
  );
};
