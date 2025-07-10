
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Check, Users, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScorecardProps {
  matchId: string;
  match: any;
  players: any[];
  onSubmitScores: () => void;
}

interface HoleData {
  hole_number: number;
  par: number;
  handicap_rating: number;
  yardage?: number;
}

interface HoleScore {
  hole: number;
  par: number;
  handicap_rating: number;
  scores: Record<string, number>;
}

export const Scorecard = ({ matchId, match, players, onSubmitScores }: ScorecardProps) => {
  const { user } = useAuth();
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [editingHole, setEditingHole] = useState<number | null>(null);
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [holesData, setHolesData] = useState<HoleData[]>([]);

  useEffect(() => {
    fetchHolesData();
    fetchExistingScores();
    fetchConfirmations();
  }, [matchId, players, match.course_id]);

  const fetchHolesData = async () => {
    if (!match.course_id) {
      // Fallback to standard pars if no course selected
      const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];
      const fallbackHoles = Array.from({ length: 18 }, (_, i) => ({
        hole_number: i + 1,
        par: standardPars[i],
        handicap_rating: i + 1 // Default handicap rating
      }));
      setHolesData(fallbackHoles);
      initializeScorecard(fallbackHoles);
      return;
    }

    try {
      const { data: holes, error } = await supabase
        .from('holes')
        .select('hole_number, par, handicap_rating, yardage')
        .eq('course_id', match.course_id)
        .order('hole_number');

      if (error) throw error;

      if (holes && holes.length > 0) {
        setHolesData(holes);
        initializeScorecard(holes);
      } else {
        // Fallback if no holes data exists for the course
        const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];
        const fallbackHoles = Array.from({ length: 18 }, (_, i) => ({
          hole_number: i + 1,
          par: standardPars[i],
          handicap_rating: i + 1
        }));
        setHolesData(fallbackHoles);
        initializeScorecard(fallbackHoles);
      }
    } catch (error) {
      console.error('Error fetching holes data:', error);
      toast({ title: "Error", description: "Failed to load course data", variant: "destructive" });
    }
  };

  const initializeScorecard = (holes: HoleData[]) => {
    const holeScores = holes.map(hole => ({
      hole: hole.hole_number,
      par: hole.par,
      handicap_rating: hole.handicap_rating,
      scores: players.reduce((acc, player) => {
        acc[player.profiles.id] = 0;
        return acc;
      }, {} as Record<string, number>)
    }));
    setHoleScores(holeScores);
  };

  const fetchExistingScores = async () => {
    try {
      const { data: scores } = await supabase
        .from('hole_scores')
        .select('player_id, hole_number, score')
        .eq('match_id', matchId);

      if (scores) {
        setHoleScores(prev => prev.map(hole => ({
          ...hole,
          scores: {
            ...hole.scores,
            ...scores
              .filter(s => s.hole_number === hole.hole)
              .reduce((acc, s) => {
                acc[s.player_id] = s.score || 0;
                return acc;
              }, {} as Record<string, number>)
          }
        })));
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const fetchConfirmations = async () => {
    try {
      const { data: confs } = await supabase
        .from('match_confirmations')
        .select('player_id')
        .eq('match_id', matchId);

      if (confs) {
        const confirmationMap = confs.reduce((acc, conf) => {
          acc[conf.player_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setConfirmations(confirmationMap);
      }
    } catch (error) {
      console.error('Error fetching confirmations:', error);
    }
  };

  const updateScore = async (hole: number, playerId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          match_id: matchId,
          player_id: playerId,
          hole_number: hole,
          score: score
        }, {
          onConflict: 'match_id,player_id,hole_number'
        });

      if (error) throw error;

      setHoleScores(prev => prev.map(h => 
        h.hole === hole 
          ? { ...h, scores: { ...h.scores, [playerId]: score } }
          : h
      ));
    } catch (error) {
      console.error('Error updating score:', error);
      toast({ title: "Error", description: "Failed to save score", variant: "destructive" });
    }
  };

  const handleScoreChange = async (hole: number, playerId: string, value: string) => {
    const score = parseInt(value) || 0;
    if (score > 0) {
      await updateScore(hole, playerId, score);
    }
  };

  const calculateTotal = (playerId: string) => {
    return holeScores.reduce((total, hole) => total + (hole.scores[playerId] || 0), 0);
  };

  const calculateToPar = (playerId: string) => {
    const total = calculateTotal(playerId);
    const totalPar = holeScores.reduce((sum, hole) => sum + hole.par, 0);
    const toPar = total - totalPar;
    return toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : toPar.toString();
  };

  // Calculate net score based on handicap and hole handicap ratings
  const calculateNetScore = (grossScore: number, playerHandicap: number, holeHandicapRating: number) => {
    if (!grossScore || !playerHandicap) return grossScore;
    
    const strokesReceived = Math.floor(playerHandicap / 18) + (playerHandicap % 18 >= holeHandicapRating ? 1 : 0);
    return Math.max(grossScore - strokesReceived, 1); // Net score can't be less than 1
  };

  const getDisplayScore = (playerId: string, hole: HoleScore) => {
    const grossScore = hole.scores[playerId] || 0;
    const player = players.find(p => p.profiles.id === playerId);
    const playerHandicap = player?.profiles.handicap || 0;
    
    // For now, always show gross score in the scorecard
    // Net calculations will be used for match results
    return grossScore;
  };

  const confirmScores = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_confirmations')
        .upsert({
          match_id: matchId,
          player_id: user?.id
        }, {
          onConflict: 'match_id,player_id'
        });

      if (error) throw error;

      toast({ title: "Success", description: "Scorecard confirmed!" });
      fetchConfirmations();
    } catch (error) {
      console.error('Error confirming scores:', error);
      toast({ title: "Error", description: "Failed to confirm scorecard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isTeamFormat = match.team_format === 'teams';
  const userConfirmed = confirmations[user?.id || ''];
  const confirmedCount = Object.keys(confirmations).length;
  const totalNeeded = players.length;
  const allConfirmed = confirmedCount === totalNeeded;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2">
            {isTeamFormat ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
            Shared Scorecard
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
            <div className="flex items-center gap-2">
              <div>
                <p className="font-medium text-sm">{player.profiles.full_name}</p>
                <p className="text-xs text-gray-500">HCP: {player.profiles.handicap}</p>
              </div>
              {confirmations[player.profiles.id] && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{calculateTotal(player.profiles.id) || '-'}</div>
              <div className="text-xs text-gray-500">{calculateToPar(player.profiles.id)}</div>
            </div>
          </div>
        ))}
      </div>

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
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-left font-medium text-xs">HCP</td>
                  {holeScores.slice(0, 9).map((hole) => (
                    <td key={hole.hole} className="p-1 text-center text-xs">{hole.handicap_rating}</td>
                  ))}
                  <td className="p-2 text-center"></td>
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
                            value={hole.scores[player.profiles.id] || ''}
                            onChange={(e) => handleScoreChange(hole.hole, player.profiles.id, e.target.value)}
                            onBlur={() => setEditingHole(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingHole(null);
                              }
                            }}
                            min="1"
                            max="15"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingHole(hole.hole)}
                            className="w-8 h-8 text-center hover:bg-gray-100 rounded flex items-center justify-center"
                          >
                            {getDisplayScore(player.profiles.id, hole) || '-'}
                          </button>
                        )}
                      </td>
                    ))}
                    <td className="p-2 text-center font-bold">
                      {holeScores.slice(0, 9).reduce((sum, h) => sum + (h.scores[player.profiles.id] || 0), 0) || '-'}
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
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-left font-medium text-xs">HCP</td>
                  {holeScores.slice(9, 18).map((hole) => (
                    <td key={hole.hole} className="p-1 text-center text-xs">{hole.handicap_rating}</td>
                  ))}
                  <td className="p-2 text-center"></td>
                  <td className="p-2 text-center"></td>
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
                            value={hole.scores[player.profiles.id] || ''}
                            onChange={(e) => handleScoreChange(hole.hole, player.profiles.id, e.target.value)}
                            onBlur={() => setEditingHole(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingHole(null);
                              }
                            }}
                            min="1"
                            max="15"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingHole(hole.hole)}
                            className="w-8 h-8 text-center hover:bg-gray-100 rounded flex items-center justify-center"
                          >
                            {getDisplayScore(player.profiles.id, hole) || '-'}
                          </button>
                        )}
                      </td>
                    ))}
                    <td className="p-2 text-center font-bold">
                      {holeScores.slice(9, 18).reduce((sum, h) => sum + (h.scores[player.profiles.id] || 0), 0) || '-'}
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

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button 
          onClick={confirmScores}
          disabled={loading || userConfirmed}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {userConfirmed ? 'Scorecard Confirmed ✓' : loading ? 'Confirming...' : 'Confirm Scorecard'}
        </Button>

        {/* Progress indicator */}
        <div className="text-center text-sm text-gray-600">
          {confirmedCount} of {totalNeeded} players have confirmed their scorecard
        </div>

        {allConfirmed && (
          <Button 
            onClick={onSubmitScores}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Complete Match
          </Button>
        )}
      </div>
    </div>
  );
};
