
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface HoleScore {
  hole: number;
  par: number;
  handicap_rating: number;
  scores: Record<string, number>;
}

export const useScorecardActions = (
  matchId: string,
  holeScores: HoleScore[],
  setHoleScores: React.Dispatch<React.SetStateAction<HoleScore[]>>,
  fetchConfirmations: () => void,
  players: any[]
) => {
  const { user } = useAuth();
  const [editingHole, setEditingHole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const updateScore = async (hole: number, playerId: string, score: number) => {
    try {
      console.log('Updating score:', { hole, playerId, score, matchId });
      
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

      if (error) {
        console.error('Error updating score:', error);
        throw error;
      }

      // Update local state immediately for better UX
      setHoleScores(prev => prev.map(h => 
        h.hole === hole 
          ? { ...h, scores: { ...h.scores, [playerId]: score } }
          : h
      ));

      console.log('Score updated successfully');
    } catch (error) {
      console.error('Error updating score:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save score. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleScoreChange = async (hole: number, playerId: string, value: string) => {
    const score = parseInt(value) || 0;
    console.log('Score change requested:', { hole, playerId, value, score });
    
    if (score >= 0 && score <= 15) {
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

  const getDisplayScore = (playerId: string, hole: HoleScore) => {
    const grossScore = hole.scores[playerId] || 0;
    return grossScore;
  };

  const confirmScores = async () => {
    setLoading(true);
    try {
      console.log('Confirming scores for user:', user?.id);
      
      const { error } = await supabase
        .from('match_confirmations')
        .upsert({
          match_id: matchId,
          player_id: user?.id
        }, {
          onConflict: 'match_id,player_id'
        });

      if (error) {
        console.error('Error confirming scores:', error);
        throw error;
      }

      toast({ title: "Success", description: "Scorecard confirmed!" });
      fetchConfirmations();
    } catch (error) {
      console.error('Error confirming scores:', error);
      toast({ 
        title: "Error", 
        description: "Failed to confirm scorecard. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    editingHole,
    setEditingHole,
    loading,
    handleScoreChange,
    calculateTotal,
    calculateToPar,
    getDisplayScore,
    confirmScores
  };
};
