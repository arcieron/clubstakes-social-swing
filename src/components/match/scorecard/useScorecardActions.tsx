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

  // Calculate the lowest handicap in the match for relative handicapping
  const getLowestHandicap = () => {
    if (players.length === 0) return 0;
    return Math.min(...players.map(player => player.profiles.handicap || 0));
  };

  // Get relative handicap for a player (their handicap minus the lowest handicap)
  const getRelativeHandicap = (playerHandicap: number) => {
    return Math.max(0, playerHandicap - getLowestHandicap());
  };

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
    const relativeHandicap = getRelativeHandicap(handicap);
    let netTotal = 0;
    
    holeScores.forEach(hole => {
      const grossScore = hole.scores[playerId] || 0;
      if (grossScore === 0) return;
      
      // Calculate strokes received based on relative handicap and hole handicap rating
      const strokesReceived = Math.floor(relativeHandicap / 18) + (relativeHandicap % 18 >= hole.handicap_rating ? 1 : 0);
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
      let score1 = hole.scores[player1.profiles.id] || 0;
      let score2 = hole.scores[player2.profiles.id] || 0;

      if (match.scoring_type === 'net') {
        const relativeHandicap1 = getRelativeHandicap(player1.profiles.handicap || 0);
        const relativeHandicap2 = getRelativeHandicap(player2.profiles.handicap || 0);
        
        const strokes1 = Math.floor(relativeHandicap1 / 18) + (relativeHandicap1 % 18 >= hole.handicap_rating ? 1 : 0);
        const strokes2 = Math.floor(relativeHandicap2 / 18) + (relativeHandicap2 % 18 >= hole.handicap_rating ? 1 : 0);
        
        score1 = score1 - strokes1;
        score2 = score2 - strokes2;
      }

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

  const calculateBetterBallWinner = (match: any) => {
    // Group players by team
    const teams = players.reduce((acc, player) => {
      const teamNumber = player.team_number || 1;
      if (!acc[teamNumber]) {
        acc[teamNumber] = [];
      }
      acc[teamNumber].push(player);
      return acc;
    }, {} as Record<number, any[]>);

    const teamScores = Object.entries(teams).map(([teamNumber, teamPlayers]) => {
      let teamTotal = 0;
      
      // Ensure holeScores is properly typed and available
      if (Array.isArray(holeScores)) {
        holeScores.forEach(hole => {
          const holeScores: number[] = [];
          
          teamPlayers.forEach(player => {
            const grossScore = hole.scores[player.profiles.id] || 0;
            if (grossScore > 0) {
              let score = grossScore;
              if (match.scoring_type === 'net') {
                const relativeHandicap = getRelativeHandicap(player.profiles.handicap || 0);
                const strokes = Math.floor(relativeHandicap / 18) + (relativeHandicap % 18 >= hole.handicap_rating ? 1 : 0);
                score = grossScore - strokes;
              }
              holeScores.push(score);
            }
          });

          // Use the best (lowest) score for the team on this hole
          if (holeScores.length > 0) {
            teamTotal += Math.min(...holeScores);
          }
        });
      }

      const teamName = `Team ${['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'][parseInt(teamNumber) - 1]}`;
      
      return {
        teamNumber: parseInt(teamNumber),
        teamName,
        players: teamPlayers,
        totalScore: teamTotal,
        toPar: teamTotal - (Array.isArray(holeScores) ? holeScores.reduce((sum, hole) => sum + hole.par, 0) : 0)
      };
    });

    const winningTeam = teamScores.reduce((lowest, current) => 
      current.totalScore < lowest.totalScore ? current : lowest
    );

    return {
      playerId: winningTeam.players[0].profiles.id, // Use first player's ID for compatibility
      playerName: winningTeam.teamName,
      totalScore: winningTeam.totalScore,
      toPar: winningTeam.toPar === 0 ? 'E' : winningTeam.toPar > 0 ? `+${winningTeam.toPar}` : winningTeam.toPar.toString(),
      teamNumber: winningTeam.teamNumber,
      teamPlayers: winningTeam.players
    };
  };

  const calculateScrambleWinner = (match: any) => {
    // Group players by team
    const teams = players.reduce((acc, player) => {
      const teamNumber = player.team_number || 1;
      if (!acc[teamNumber]) {
        acc[teamNumber] = [];
      }
      acc[teamNumber].push(player);
      return acc;
    }, {} as Record<number, any[]>);

    const teamScores = Object.entries(teams).map(([teamNumber, teamPlayers]) => {
      const teamScoreId = `team_${teamNumber}`;
      const teamTotal = Array.isArray(holeScores) 
        ? holeScores.reduce((total, hole) => total + (hole.scores[teamScoreId] || 0), 0)
        : 0;
      
      const teamName = `Team ${['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'][parseInt(teamNumber) - 1]}`;
      
      return {
        teamNumber: parseInt(teamNumber),
        teamName,
        players: teamPlayers,
        totalScore: teamTotal,
        toPar: teamTotal - (Array.isArray(holeScores) ? holeScores.reduce((sum, hole) => sum + hole.par, 0) : 0)
      };
    });

    const winningTeam = teamScores.reduce((lowest, current) => 
      current.totalScore < lowest.totalScore ? current : lowest
    );

    return {
      playerId: winningTeam.players[0].profiles.id, // Use first player's ID for compatibility
      playerName: winningTeam.teamName,
      totalScore: winningTeam.totalScore,
      toPar: winningTeam.toPar === 0 ? 'E' : winningTeam.toPar > 0 ? `+${winningTeam.toPar}` : winningTeam.toPar.toString(),
      teamNumber: winningTeam.teamNumber,
      teamPlayers: winningTeam.players
    };
  };

  const calculateNassauWinner = (match: any) => {
    const front9 = holeScores.slice(0, 9);
    const back9 = holeScores.slice(9, 18);
    
    const playerScores = players.map(player => {
      const grossTotal = calculateGrossTotal(player.profiles.id);
      const netTotal = match.scoring_type === 'net' 
        ? calculateNetScore(player.profiles.id, player.profiles.handicap || 0)
        : grossTotal;
      
      const relativeHandicap = getRelativeHandicap(player.profiles.handicap || 0);
      
      const front9Score = front9.reduce((sum, hole) => {
        let holeScore = hole.scores[player.profiles.id] || 0;
        if (match.scoring_type === 'net' && holeScore > 0) {
          const strokes = Math.floor(relativeHandicap / 18) + (relativeHandicap % 18 >= hole.handicap_rating ? 1 : 0);
          holeScore = holeScore - strokes;
        }
        return sum + holeScore;
      }, 0);

      const back9Score = back9.reduce((sum, hole) => {
        let holeScore = hole.scores[player.profiles.id] || 0;
        if (match.scoring_type === 'net' && holeScore > 0) {
          const strokes = Math.floor(relativeHandicap / 18) + (relativeHandicap % 18 >= hole.handicap_rating ? 1 : 0);
          holeScore = holeScore - strokes;
        }
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

    // Calculate winners for each competition
    const front9Winner = playerScores.reduce((lowest, current) => 
      current.front9Score < lowest.front9Score ? current : lowest
    );
    const back9Winner = playerScores.reduce((lowest, current) => 
      current.back9Score < lowest.back9Score ? current : lowest
    );
    const overallWinner = playerScores.reduce((lowest, current) => 
      current.totalScore < lowest.totalScore ? current : lowest
    );

    return {
      front9Winner,
      back9Winner,
      overallWinner,
      // Return overall winner as main winner for backward compatibility
      playerId: overallWinner.playerId,
      playerName: overallWinner.playerName,
      totalScore: overallWinner.totalScore,
      toPar: overallWinner.toPar
    };
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
          let score = grossScore;
          if (match.scoring_type === 'net') {
            const relativeHandicap = getRelativeHandicap(player.profiles.handicap || 0);
            const strokes = Math.floor(relativeHandicap / 18) + (relativeHandicap % 18 >= hole.handicap_rating ? 1 : 0);
            score = grossScore - strokes;
          }
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
        winner = calculateScrambleWinner(match);
        break;
      
      case 'better-ball':
        winner = calculateBetterBallWinner(match);
        break;
      
      default:
        winner = calculateStrokePlayWinner(match);
    }

    console.log('Winner calculated:', winner);
    return winner;
  };

  const disperseCredits = async (winner: any, wagerAmount: number) => {
    try {
      console.log('Dispersing credits:', { winner, wagerAmount });
      
      // Handle Nassau format with multiple winners
      if (match.format === 'nassau' && winner.front9Winner) {
        const front9Amount = Math.floor(wagerAmount * 0.25 * players.length);
        const back9Amount = Math.floor(wagerAmount * 0.25 * players.length);
        const overallAmount = Math.floor(wagerAmount * 0.5 * players.length);

        // Add credits to front 9 winner
        const { error: front9Error } = await supabase.rpc('add_credits', {
          user_id: winner.front9Winner.playerId,
          amount: front9Amount
        });

        if (front9Error) {
          console.error('Error adding front 9 credits:', front9Error);
          throw front9Error;
        }

        // Add credits to back 9 winner
        const { error: back9Error } = await supabase.rpc('add_credits', {
          user_id: winner.back9Winner.playerId,
          amount: back9Amount
        });

        if (back9Error) {
          console.error('Error adding back 9 credits:', back9Error);
          throw back9Error;
        }

        // Add credits to overall winner
        const { error: overallError } = await supabase.rpc('add_credits', {
          user_id: winner.overallWinner.playerId,
          amount: overallAmount
        });

        if (overallError) {
          console.error('Error adding overall credits:', overallError);
          throw overallError;
        }

        // Deduct credits from all players
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
      } else if ((match.format === 'scramble' || match.format === 'better-ball') && winner.teamPlayers) {
        // For team formats, distribute winnings to all team members
        const totalPot = wagerAmount * players.length;
        const perPlayerWinning = Math.floor(totalPot / winner.teamPlayers.length);

        // Add credits to each winning team member
        for (const teamPlayer of winner.teamPlayers) {
          const { error: addError } = await supabase.rpc('add_credits', {
            user_id: teamPlayer.profiles.id,
            amount: perPlayerWinning
          });

          if (addError) {
            console.error('Error adding credits to team member:', addError);
            throw addError;
          }
        }

        // Deduct credits from all players
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
      } else {
        // Standard format - winner gets total pot
        const { error: addError } = await supabase.rpc('add_credits', {
          user_id: winner.playerId,
          amount: wagerAmount * players.length
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
      const winnerId = match.format === 'nassau' && winner.overallWinner 
        ? winner.overallWinner.playerId 
        : winner.playerId;

      const { error: updateError } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          winner_id: winnerId
        })
        .eq('id', matchId);

      if (updateError) {
        console.error('Error updating match:', updateError);
        throw updateError;
      }

      // Disperse credits
      await disperseCredits(winner, match.wager_amount);

      // Create appropriate toast message
      let toastMessage = '';
      if (match.format === 'nassau' && winner.front9Winner) {
        const front9Name = winner.front9Winner.playerName;
        const back9Name = winner.back9Winner.playerName;
        const overallName = winner.overallWinner.playerName;
        toastMessage = `Nassau Complete! Front 9: ${front9Name}, Back 9: ${back9Name}, Overall: ${overallName}`;
      } else {
        toastMessage = `${winner.playerName} wins! Credits have been distributed.`;
      }

      toast({
        title: "Match Complete!",
        description: toastMessage,
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
