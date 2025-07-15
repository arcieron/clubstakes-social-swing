import { useState, useEffect } from 'react';
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
  players: any[],
  confirmations: Record<string, boolean>,
  match: any
) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Auto-complete match when all players confirm
  useEffect(() => {
    const confirmedCount = Object.keys(confirmations).length;
    const allConfirmed = confirmedCount === players.length && players.length > 0;
    
    if (allConfirmed && match?.status === 'in_progress') {
      console.log('All players confirmed, auto-completing match');
      completeMatch(match);
    }
  }, [confirmations, players.length, match?.status]);

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

  const calculateGrossTotal = (playerId: string) => {
    return holeScores.reduce((total, hole) => total + (hole.scores[playerId] || 0), 0);
  };

  const calculateNetScore = (playerId: string, handicap: number) => {
    let netTotal = 0;
    holeScores.forEach(hole => {
      const grossScore = hole.scores[playerId] || 0;
      if (grossScore === 0) return;
      
      // Calculate strokes received based on handicap and hole handicap rating
      const strokesReceived = Math.floor(handicap / 18) + (handicap % 18 >= hole.handicap_rating ? 1 : 0);
      const netScore = Math.max(grossScore - strokesReceived, 0);
      netTotal += netScore;
    });
    return netTotal;
  };

  const calculateTotal = (playerId: string) => {
    return calculateGrossTotal(playerId);
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

  const calculateMatchPlayWinner = (match: any) => {
    // For match play, we need to compare hole by hole
    if (players.length !== 2) {
      // Multi-player match play not supported, fall back to stroke play
      return calculateStrokePlayWinner(match);
    }

    const [player1, player2] = players;
    let player1Holes = 0;
    let player2Holes = 0;

    holeScores.forEach(hole => {
      const score1 = match.scoring_type === 'net' 
        ? hole.scores[player1.profiles.id] - Math.floor(player1.profiles.handicap / 18) - (player1.profiles.handicap % 18 >= hole.handicap_rating ? 1 : 0)
        : hole.scores[player1.profiles.id];
      
      const score2 = match.scoring_type === 'net'
        ? hole.scores[player2.profiles.id] - Math.floor(player2.profiles.handicap / 18) - (player2.profiles.handicap % 18 >= hole.handicap_rating ? 1 : 0)
        : hole.scores[player2.profiles.id];

      if (score1 > 0 && score2 > 0) {
        if (score1 < score2) player1Holes++;
        else if (score2 < score1) player2Holes++;
      }
    });

    return player1Holes > player2Holes ? {
      playerId: player1.profiles.id,
      playerName: player1.profiles.full_name,
      totalScore: player1Holes,
      toPar: `${player1Holes} holes won`
    } : {
      playerId: player2.profiles.id,
      playerName: player2.profiles.full_name,
      totalScore: player2Holes,
      toPar: `${player2Holes} holes won`
    };
  };

  const calculateStrokePlayWinner = (match: any) => {
    const playerScores = players.map(player => {
      const grossTotal = calculateGrossTotal(player.profiles.id);
      const netTotal = match.scoring_type === 'net' 
        ? calculateNetScore(player.profiles.id, player.profiles.handicap || 0)
        : grossTotal;
      
      return {
        playerId: player.profiles.id,
        playerName: player.profiles.full_name,
        totalScore: netTotal,
        toPar: netTotal - holeScores.reduce((sum, hole) => sum + hole.par, 0)
      };
    });

    return playerScores.reduce((lowest, current) => 
      current.totalScore < lowest.totalScore ? current : lowest
    );
  };

  const calculateNassauWinner = (match: any) => {
    const front9 = holeScores.slice(0, 9);
    const back9 = holeScores.slice(9, 18);
    
    const playerScores = players.map(player => {
      const grossTotal = calculateGrossTotal(player.profiles.id);
      const netTotal = match.scoring_type === 'net' 
        ? calculateNetScore(player.profiles.id, player.profiles.handicap || 0)
        : grossTotal;
      
      const front9Score = front9.reduce((sum, hole) => {
        const holeScore = match.scoring_type === 'net'
          ? (hole.scores[player.profiles.id] || 0) - Math.floor((player.profiles.handicap || 0) / 18) - ((player.profiles.handicap || 0) % 18 >= hole.handicap_rating ? 1 : 0)
          : (hole.scores[player.profiles.id] || 0);
        return sum + holeScore;
      }, 0);

      const back9Score = back9.reduce((sum, hole) => {
        const holeScore = match.scoring_type === 'net'
          ? (hole.scores[player.profiles.id] || 0) - Math.floor((player.profiles.handicap || 0) / 18) - ((player.profiles.handicap || 0) % 18 >= hole.handicap_rating ? 1 : 0)
          : (hole.scores[player.profiles.id] || 0);
        return sum + holeScore;
      }, 0);

      return {
        playerId: player.profiles.id,
        playerName: player.profiles.full_name,
        totalScore: netTotal,
        front9Score,
        back9Score,
        toPar: netTotal - holeScores.reduce((sum, hole) => sum + hole.par, 0)
      };
    });

    // Calculate Nassau points (front 9, back 9, overall)
    const front9Winner = playerScores.reduce((lowest, current) => 
      current.front9Score < lowest.front9Score ? current : lowest
    );
    const back9Winner = playerScores.reduce((lowest, current) => 
      current.back9Score < lowest.back9Score ? current : lowest
    );
    const overallWinner = playerScores.reduce((lowest, current) => 
      current.totalScore < lowest.totalScore ? current : lowest
    );

    // For simplicity, return the overall winner (could be enhanced to track all three)
    return overallWinner;
  };

  const calculateSkinsWinner = (match: any) => {
    const skinsCounts: Record<string, number> = {};
    
    // Initialize skins count for each player
    players.forEach(player => {
      skinsCounts[player.profiles.id] = 0;
    });

    // Calculate skins for each hole
    holeScores.forEach(hole => {
      const holeScores: { playerId: string; score: number }[] = [];
      
      players.forEach(player => {
        const grossScore = hole.scores[player.profiles.id] || 0;
        if (grossScore > 0) {
          const score = match.scoring_type === 'net'
            ? grossScore - Math.floor((player.profiles.handicap || 0) / 18) - ((player.profiles.handicap || 0) % 18 >= hole.handicap_rating ? 1 : 0)
            : grossScore;
          holeScores.push({ playerId: player.profiles.id, score });
        }
      });

      if (holeScores.length > 0) {
        const lowestScore = Math.min(...holeScores.map(s => s.score));
        const winners = holeScores.filter(s => s.score === lowestScore);
        
        // Only award skin if there's a single winner
        if (winners.length === 1) {
          skinsCounts[winners[0].playerId]++;
        }
      }
    });

    // Find player with most skins
    const winnerEntry = Object.entries(skinsCounts).reduce((max, [playerId, count]) => 
      count > max.count ? { playerId, count } : max
    , { playerId: '', count: 0 });

    const winner = players.find(p => p.profiles.id === winnerEntry.playerId);
    
    return {
      playerId: winnerEntry.playerId,
      playerName: winner?.profiles.full_name || '',
      totalScore: winnerEntry.count,
      toPar: `${winnerEntry.count} skins won`
    };
  };

  const calculateWinner = (match: any) => {
    console.log('Calculating winner for match:', match);
    
    let winner = null;

    switch (match.format) {
      case 'stroke-play':
        winner = calculateStrokePlayWinner(match);
        break;
      
      case 'match-play':
        winner = calculateMatchPlayWinner(match);
        break;
      
      case 'nassau':
        winner = calculateNassauWinner(match);
        break;
      
      case 'skins':
        winner = calculateSkinsWinner(match);
        break;
      
      case 'scramble':
      case 'better-ball':
        // For team formats, use stroke play logic
        winner = calculateStrokePlayWinner(match);
        break;
      
      default:
        winner = calculateStrokePlayWinner(match);
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
      console.log('Auto-completing match:', match);
      
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
    confirmScores
  };
};
