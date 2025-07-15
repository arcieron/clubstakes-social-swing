
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

  const calculateWinner = (match: any) => {
    console.log('Calculating winner for match:', match);
    
    const playerScores = players.map(player => ({
      playerId: player.profiles.id,
      playerName: player.profiles.full_name,
      totalScore: calculateTotal(player.profiles.id),
      toPar: calculateTotal(player.profiles.id) - holeScores.reduce((sum, hole) => sum + hole.par, 0)
    }));

    console.log('Player scores:', playerScores);

    let winner = null;

    switch (match.format) {
      case 'stroke-play':
        // Lowest total score wins
        winner = playerScores.reduce((lowest, current) => 
          current.totalScore < lowest.totalScore ? current : lowest
        );
        break;
      
      case 'match-play':
        // This would require hole-by-hole comparison, for now use stroke play logic
        winner = playerScores.reduce((lowest, current) => 
          current.totalScore < lowest.totalScore ? current : lowest
        );
        break;
      
      case 'nassau':
        // For Nassau, we'll use total score for now (would need front/back 9 logic)
        winner = playerScores.reduce((lowest, current) => 
          current.totalScore < lowest.totalScore ? current : lowest
        );
        break;
      
      case 'skins':
        // For skins, we'll use total score for now (would need hole-by-hole logic)
        winner = playerScores.reduce((lowest, current) => 
          current.totalScore < lowest.totalScore ? current : lowest
        );
        break;
      
      default:
        winner = playerScores.reduce((lowest, current) => 
          current.totalScore < lowest.totalScore ? current : lowest
        );
    }

    console.log('Winner calculated:', winner);
    return winner;
  };

  const disperseCredits = async (winnerId: string, wagerAmount: number) => {
    try {
      console.log('Dispersing credits:', { winnerId, wagerAmount });
      
      // Add credits to winner
      const { error: addError } = await supabase.rpc('add_credits', {
        user_id: winnerId,
        amount: wagerAmount * players.length // Winner gets total pot
      });

      if (addError) {
        console.error('Error adding credits to winner:', addError);
        throw addError;
      }

      // Deduct credits from all players (including winner, so winner gets net positive)
      for (const player of players) {
        const { error: deductError } = await supabase.rpc('add_credits', {
          user_id: player.profiles.id,
          amount: -wagerAmount
        });

        if (deductError) {
          console.error('Error deducting credits from player:', deductError);
          throw deductError;
        }
      }

      console.log('Credits dispersed successfully');
    } catch (error) {
      console.error('Error dispersing credits:', error);
      throw error;
    }
  };

  const completeMatch = async (match: any) => {
    try {
      console.log('Completing match:', match);
      
      const winner = calculateWinner(match);
      
      // Update match with winner and completion status
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          winner_id: winner.playerId
        })
        .eq('id', matchId);

      if (updateError) {
        console.error('Error updating match:', updateError);
        throw updateError;
      }

      // Disperse credits
      await disperseCredits(winner.playerId, match.wager_amount);

      toast({
        title: "Match Complete!",
        description: `${winner.playerName} wins! Credits have been distributed.`,
      });

      console.log('Match completed successfully');
    } catch (error) {
      console.error('Error completing match:', error);
      toast({
        title: "Error",
        description: "Failed to complete match. Please try again.",
        variant: "destructive"
      });
    }
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
    loading,
    handleScoreChange,
    calculateTotal,
    calculateToPar,
    getDisplayScore,
    confirmScores,
    completeMatch
  };
};
