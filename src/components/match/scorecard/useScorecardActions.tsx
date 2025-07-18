
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

  // Standardized relative handicapping - use this for ALL formats
  const getLowestHandicap = (): number => {
    return Math.min(...players.map(player => player.profiles?.handicap || 0));
  };

  const getRelativeHandicap = (player: any, lowestHandicap: number): number => {
    const playerHandicap = player.profiles?.handicap || 0;
    return playerHandicap - lowestHandicap;
  };

  const getStrokesOnHole = (player: any, holeHandicapRating: number) => {
    const lowestHandicap = getLowestHandicap();
    const relativeHandicap = getRelativeHandicap(player, lowestHandicap);
    const handicap = Math.round(relativeHandicap);
    
    if (handicap > 0) {
      const strokesPerHole = Math.floor(handicap / 18);
      const extraStrokes = handicap % 18;
      
      let strokes = strokesPerHole;
      if (extraStrokes >= holeHandicapRating) {
        strokes += 1;
      }
      
      return strokes;
    }
    
    return 0;
  };

  const getNetScoreOnHole = (grossScore: number, player: any, holeHandicapRating: number) => {
    if (grossScore === 0) return 0;
    const strokes = getStrokesOnHole(player, holeHandicapRating);
    return grossScore - strokes;
  };

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

  const calculateNetTotal = (playerId: string) => {
    const player = players.find(p => p.profiles.id === playerId);
    if (!player) return 0;

    return holeScores.reduce((total, hole) => {
      const grossScore = hole.scores[playerId] || 0;
      if (grossScore === 0) return total;
      
      const netScore = getNetScoreOnHole(grossScore, player, hole.handicap_rating);
      return total + netScore;
    }, 0);
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

  const findWinnersWithTies = (playerScores: any[]) => {
    if (playerScores.length === 0) return [];
    
    const lowestScore = Math.min(...playerScores.map(p => p.totalScore));
    return playerScores.filter(p => p.totalScore === lowestScore);
  };

  const calculateMatchPlayWinner = (match: any) => {
    if (players.length !== 2) {
      return calculateStrokePlayWinner(match);
    }

    const [player1, player2] = players;
    let player1Holes = 0;
    let player2Holes = 0;

    holeScores.forEach(hole => {
      let score1 = hole.scores[player1.profiles.id] || 0;
      let score2 = hole.scores[player2.profiles.id] || 0;

      if (score1 > 0 && score2 > 0) {
        score1 = getNetScoreOnHole(score1, player1, hole.handicap_rating);
        score2 = getNetScoreOnHole(score2, player2, hole.handicap_rating);

        if (score1 < score2) player1Holes++;
        else if (score2 < score1) player2Holes++;
      }
    });

    if (player1Holes === player2Holes) {
      return [
        {
          playerId: player1.profiles.id,
          playerName: player1.profiles.full_name,
          totalScore: player1Holes,
          toPar: `${player1Holes} holes won (tied)`
        },
        {
          playerId: player2.profiles.id,
          playerName: player2.profiles.full_name,
          totalScore: player2Holes,
          toPar: `${player2Holes} holes won (tied)`
        }
      ];
    }

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
      const netTotal = calculateNetTotal(player.profiles.id);
      
      const scoreToUse = match.scoring_type === 'net' ? netTotal : grossTotal;
      
      return {
        playerId: player.profiles.id,
        playerName: player.profiles.full_name,
        totalScore: scoreToUse,
        toPar: scoreToUse - holeScores.reduce((sum, hole) => sum + hole.par, 0)
      };
    });

    return findWinnersWithTies(playerScores);
  };

  const calculateBetterBallWinner = (match: any) => {
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
      
      if (Array.isArray(holeScores)) {
        holeScores.forEach(hole => {
          const teamHoleScores: number[] = [];
          
          if (Array.isArray(teamPlayers)) {
            teamPlayers.forEach(player => {
              const grossScore = hole.scores[player.profiles.id] || 0;
              if (grossScore > 0) {
                let score = getNetScoreOnHole(grossScore, player, hole.handicap_rating);
                teamHoleScores.push(score);
              }
            });
          }

          if (teamHoleScores.length > 0) {
            teamTotal += Math.min(...teamHoleScores);
          }
        });
      }

      const teamName = `Team ${['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'][parseInt(teamNumber) - 1]}`;
      
      return {
        teamNumber: parseInt(teamNumber),
        teamName,
        players: teamPlayers,
        totalScore: teamTotal,
        toPar: Array.isArray(holeScores) ? teamTotal - holeScores.reduce((sum, hole) => sum + hole.par, 0) : 0
      };
    });

    const winningTeams = findWinnersWithTies(teamScores);
    
    if (winningTeams.length === 1) {
      const winningTeam = winningTeams[0];
      return {
        playerId: winningTeam.players[0].profiles.id,
        playerName: winningTeam.teamName,
        totalScore: winningTeam.totalScore,
        toPar: winningTeam.toPar === 0 ? 'E' : winningTeam.toPar > 0 ? `+${winningTeam.toPar}` : winningTeam.toPar.toString(),
        teamNumber: winningTeam.teamNumber,
        teamPlayers: winningTeam.players
      };
    }

    return winningTeams.map(team => ({
      playerId: team.players[0].profiles.id,
      playerName: team.teamName + ' (tied)',
      totalScore: team.totalScore,
      toPar: team.toPar === 0 ? 'E' : team.toPar > 0 ? `+${team.toPar}` : team.toPar.toString(),
      teamNumber: team.teamNumber,
      teamPlayers: team.players
    }));
  };

  const calculateScrambleWinner = (match: any) => {
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
      let teamTotal = 0;
      
      if (Array.isArray(holeScores)) {
        holeScores.forEach(hole => {
          const grossScore = hole.scores[teamScoreId] || 0;
          if (grossScore > 0) {
            let score = grossScore;
            if (match.scoring_type === 'net') {
              const lowestHandicap = getLowestHandicap();
              const teamHandicap = Array.isArray(teamPlayers) 
                ? teamPlayers.reduce((sum, player) => sum + (player.profiles.handicap || 0), 0) / teamPlayers.length 
                : 0;
              const relativeTeamHandicap = teamHandicap - lowestHandicap;
              
              if (relativeTeamHandicap > 0) {
                const handicap = Math.round(relativeTeamHandicap);
                const strokesPerHole = Math.floor(handicap / 18);
                const extraStrokes = handicap % 18;
                
                let strokes = strokesPerHole;
                if (extraStrokes >= hole.handicap_rating) {
                  strokes += 1;
                }
                
                score = grossScore - strokes;
              }
            }
            teamTotal += score;
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

    const winningTeams = findWinnersWithTies(teamScores);
    
    if (winningTeams.length === 1) {
      const winningTeam = winningTeams[0];
      return {
        playerId: winningTeam.players[0].profiles.id,
        playerName: winningTeam.teamName,
        totalScore: winningTeam.totalScore,
        toPar: winningTeam.toPar === 0 ? 'E' : winningTeam.toPar > 0 ? `+${winningTeam.toPar}` : winningTeam.toPar.toString(),
        teamNumber: winningTeam.teamNumber,
        teamPlayers: winningTeam.players
      };
    }

    return winningTeams.map(team => ({
      playerId: team.players[0].profiles.id,
      playerName: team.teamName + ' (tied)',
      totalScore: team.totalScore,
      toPar: team.toPar === 0 ? 'E' : team.toPar > 0 ? `+${team.toPar}` : team.toPar.toString(),
      teamNumber: team.teamNumber,
      teamPlayers: team.players
    }));
  };

  // Fixed Nassau calculation - simplified and standardized
  const calculateNassauWinner = (match: any) => {
    const front9 = holeScores.slice(0, 9);
    const back9 = holeScores.slice(9, 18);
    
    const calculateNineScore = (holes: HoleScore[], playerId: string) => {
      const player = players.find(p => p.profiles.id === playerId);
      if (!player) return 0;

      return holes.reduce((sum, hole) => {
        const grossScore = hole.scores[playerId] || 0;
        if (grossScore === 0) return sum;
        
        const netScore = getNetScoreOnHole(grossScore, player, hole.handicap_rating);
        return sum + netScore;
      }, 0);
    };

    const playerScores = players.map(player => {
      const front9Score = calculateNineScore(front9, player.profiles.id);
      const back9Score = calculateNineScore(back9, player.profiles.id);
      const totalScore = front9Score + back9Score;

      return {
        playerId: player.profiles.id,
        playerName: player.profiles.full_name,
        front9Score,
        back9Score,
        totalScore
      };
    });

    const front9Winners = findWinnersWithTies(playerScores.map(p => ({ ...p, totalScore: p.front9Score })));
    const back9Winners = findWinnersWithTies(playerScores.map(p => ({ ...p, totalScore: p.back9Score })));
    const overallWinners = findWinnersWithTies(playerScores);

    return {
      front9Winners,
      back9Winners,
      overallWinners,
      playerId: overallWinners[0]?.playerId,
      playerName: overallWinners[0]?.playerName,
      totalScore: overallWinners[0]?.totalScore
    };
  };

  // Fixed Skins calculation with carryover logic
  const calculateSkinsWinner = (match: any) => {
    const playerSkins: Record<string, { count: number; holes: number[] }> = {};
    let carryoverSkins = 0; // Track skins that carry over from tied holes
    
    players.forEach(player => {
      playerSkins[player.profiles.id] = { count: 0, holes: [] };
    });

    holeScores.forEach(hole => {
      const holeScores: { playerId: string; score: number }[] = [];
      
      players.forEach(player => {
        const grossScore = hole.scores[player.profiles.id] || 0;
        if (grossScore > 0) {
          const netScore = getNetScoreOnHole(grossScore, player, hole.handicap_rating);
          holeScores.push({ playerId: player.profiles.id, score: netScore });
        }
      });

      if (holeScores.length > 0) {
        const lowestScore = Math.min(...holeScores.map(s => s.score));
        const winners = holeScores.filter(s => s.score === lowestScore);
        
        if (winners.length === 1) {
          // Single winner gets this skin plus any carryover skins
          const skinsWon = 1 + carryoverSkins;
          playerSkins[winners[0].playerId].count += skinsWon;
          playerSkins[winners[0].playerId].holes.push(hole.hole);
          carryoverSkins = 0; // Reset carryover
        } else {
          // Tie - skin carries over to next hole
          carryoverSkins += 1;
        }
      }
    });

    const skinsResults = Object.entries(playerSkins).map(([playerId, skins]) => {
      const player = players.find(p => p.profiles.id === playerId);
      return {
        playerId,
        playerName: player?.profiles.full_name || '',
        skinsWon: skins.count,
        holesWon: skins.holes,
        totalScore: skins.count
      };
    });

    const totalSkins = skinsResults.reduce((sum, player) => sum + player.skinsWon, 0);
    const maxSkins = Math.max(...skinsResults.map(p => p.skinsWon));

    return {
      skinsResults,
      totalSkins,
      carryoverSkins, // Include remaining carryover skins
      playerId: skinsResults.find(p => p.skinsWon === maxSkins)?.playerId,
      playerName: skinsResults.find(p => p.skinsWon === maxSkins)?.playerName,
      totalScore: maxSkins,
      toPar: `${maxSkins} skins won`
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

  // Fixed credit distribution logic
  const disperseCredits = async (winner: any, wagerAmount: number) => {
    try {
      console.log('Dispersing credits:', { winner, wagerAmount });
      
      if (match.format === 'skins' && winner.skinsResults) {
        const totalPot = wagerAmount * players.length;
        const totalSkins = winner.totalSkins;
        
        if (totalSkins === 0) {
          console.log('No skins won, refunding all players');
          toast({
            title: "No Skins Won",
            description: "All holes were tied. Everyone gets their wager back.",
          });
          return;
        }
        
        const perSkinValue = Math.floor(totalPot / totalSkins);
        
        for (const playerResult of winner.skinsResults) {
          if (playerResult.skinsWon > 0) {
            const creditsToAdd = playerResult.skinsWon * perSkinValue;
            const { error: addError } = await supabase.rpc('add_credits', {
              user_id: playerResult.playerId,
              amount: creditsToAdd
            });
            if (addError) throw addError;
          }
        }
        
        for (const player of players) {
          const { error: deductError } = await supabase.rpc('add_credits', {
            user_id: player.profiles.id,
            amount: -wagerAmount
          });
          if (deductError) throw deductError;
        }
        
        console.log('Skins credits dispersed successfully');
        return;
      }

      // Simplified Nassau payout - each competition is worth 1/3 of total pot
      if (match.format === 'nassau' && winner.front9Winners) {
        const totalPot = wagerAmount * players.length;
        const competitionValue = Math.floor(totalPot / 3);

        // Front 9 payout
        const front9Payout = Math.floor(competitionValue / winner.front9Winners.length);
        for (const front9Winner of winner.front9Winners) {
          const { error: front9Error } = await supabase.rpc('add_credits', {
            user_id: front9Winner.playerId,
            amount: front9Payout
          });
          if (front9Error) throw front9Error;
        }

        // Back 9 payout
        const back9Payout = Math.floor(competitionValue / winner.back9Winners.length);
        for (const back9Winner of winner.back9Winners) {
          const { error: back9Error } = await supabase.rpc('add_credits', {
            user_id: back9Winner.playerId,
            amount: back9Payout
          });
          if (back9Error) throw back9Error;
        }

        // Overall payout
        const overallPayout = Math.floor(competitionValue / winner.overallWinners.length);
        for (const overallWinner of winner.overallWinners) {
          const { error: overallError } = await supabase.rpc('add_credits', {
            user_id: overallWinner.playerId,
            amount: overallPayout
          });
          if (overallError) throw overallError;
        }

        // Deduct wager from all players
        for (const player of players) {
          const { error: deductError } = await supabase.rpc('add_credits', {
            user_id: player.profiles.id,
            amount: -wagerAmount
          });
          if (deductError) throw deductError;
        }

      } else if (Array.isArray(winner)) {
        // Handle ties - split the pot
        const totalPot = wagerAmount * players.length;
        const isTeamFormat = (match.format === 'scramble' || match.format === 'better-ball') && winner[0]?.teamPlayers;
        
        if (isTeamFormat) {
          const totalWinningPlayers = winner.reduce((sum, team) => sum + team.teamPlayers.length, 0);
          const perPlayerWinning = Math.floor(totalPot / totalWinningPlayers);
          
          for (const winningTeam of winner) {
            for (const teamPlayer of winningTeam.teamPlayers) {
              const { error: addError } = await supabase.rpc('add_credits', {
                user_id: teamPlayer.profiles.id,
                amount: perPlayerWinning
              });
              if (addError) throw addError;
            }
          }
        } else {
          const perPlayerWinning = Math.floor(totalPot / winner.length);
          
          for (const tiedWinner of winner) {
            const { error: addError } = await supabase.rpc('add_credits', {
              user_id: tiedWinner.playerId,
              amount: perPlayerWinning
            });
            if (addError) throw addError;
          }
        }

        // Deduct wager from all players
        for (const player of players) {
          const { error: deductError } = await supabase.rpc('add_credits', {
            user_id: player.profiles.id,
            amount: -wagerAmount
          });
          if (deductError) throw deductError;
        }

      } else if ((match.format === 'scramble' || match.format === 'better-ball') && winner.teamPlayers) {
        // Single winning team
        const totalPot = wagerAmount * players.length;
        const perPlayerWinning = Math.floor(totalPot / winner.teamPlayers.length);

        for (const teamPlayer of winner.teamPlayers) {
          const { error: addError } = await supabase.rpc('add_credits', {
            user_id: teamPlayer.profiles.id,
            amount: perPlayerWinning
          });
          if (addError) throw addError;
        }

        for (const player of players) {
          const { error: deductError } = await supabase.rpc('add_credits', {
            user_id: player.profiles.id,
            amount: -wagerAmount
          });
          if (deductError) throw deductError;
        }
      } else {
        // Standard single winner
        const { error: addError } = await supabase.rpc('add_credits', {
          user_id: winner.playerId,
          amount: wagerAmount * players.length
        });
        if (addError) throw addError;

        for (const player of players) {
          const { error: deductError } = await supabase.rpc('add_credits', {
            user_id: player.profiles.id,
            amount: -wagerAmount
          });
          if (deductError) throw deductError;
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
      
      const winnerId = match.format === 'nassau' && winner.overallWinners 
        ? winner.overallWinners[0]?.playerId 
        : Array.isArray(winner) 
          ? winner[0]?.playerId 
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

      await disperseCredits(winner, match.wager_amount);

      let toastMessage = '';
      if (match.format === 'skins' && winner.skinsResults) {
        const playerSummaries = winner.skinsResults
          .filter(p => p.skinsWon > 0)
          .map(p => `${p.playerName}: ${p.skinsWon} skins`)
          .join(', ');
        toastMessage = playerSummaries || 'No skins won, all wagers refunded';
      } else if (match.format === 'nassau' && winner.front9Winners) {
        const front9Names = winner.front9Winners.map(w => w.playerName).join(', ');
        const back9Names = winner.back9Winners.map(w => w.playerName).join(', ');
        const overallNames = winner.overallWinners.map(w => w.playerName).join(', ');
        toastMessage = `Nassau Complete! Front 9: ${front9Names}, Back 9: ${back9Names}, Overall: ${overallNames}`;
      } else if (Array.isArray(winner)) {
        const winnerNames = winner.map(w => w.playerName).join(', ');
        toastMessage = `Tie! ${winnerNames} split the pot. Credits have been distributed.`;
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
