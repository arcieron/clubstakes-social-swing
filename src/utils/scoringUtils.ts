
import { supabase } from '@/integrations/supabase/client';

export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  handicap: number;
  netScore?: number;
  position: number;
  points?: number;
  holesWon?: number;
  skinsWon?: number;
}

export interface MatchResult {
  winners: PlayerScore[];
  results: PlayerScore[];
  payouts: Record<string, number>;
}

// Calculate net score based on handicap
export const calculateNetScore = (grossScore: number, handicap: number, courseRating: number = 72): number => {
  return grossScore - handicap;
};

// Stroke Play scoring
export const calculateStrokePlayResults = (
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number
): MatchResult => {
  const results: PlayerScore[] = players.map(player => {
    const playerId = player.profiles.id;
    const totalScore = scores[playerId] || 0;
    const netScore = calculateNetScore(totalScore, player.profiles.handicap);
    
    return {
      playerId,
      playerName: player.profiles.full_name,
      totalScore,
      handicap: player.profiles.handicap,
      netScore,
      position: 0
    };
  }).sort((a, b) => (a.netScore || 0) - (b.netScore || 0));

  // Assign positions
  results.forEach((result, index) => {
    result.position = index + 1;
  });

  const winners = results.filter(r => r.position === 1);
  const totalPot = wagerAmount * players.length;
  const winnerPayout = Math.floor(totalPot / winners.length);

  const payouts: Record<string, number> = {};
  winners.forEach(winner => {
    payouts[winner.playerId] = winnerPayout;
  });

  return { winners, results, payouts };
};

// Match Play scoring (based on holes won)
export const calculateMatchPlayResults = (
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number
): MatchResult => {
  const results: PlayerScore[] = players.map(player => {
    const playerId = player.profiles.id;
    const holesWon = scores[playerId] || 0;
    
    return {
      playerId,
      playerName: player.profiles.full_name,
      totalScore: holesWon,
      handicap: player.profiles.handicap,
      holesWon,
      position: 0
    };
  }).sort((a, b) => (b.holesWon || 0) - (a.holesWon || 0));

  // Assign positions
  results.forEach((result, index) => {
    result.position = index + 1;
  });

  const winners = results.filter(r => r.position === 1);
  const totalPot = wagerAmount * players.length;
  const winnerPayout = Math.floor(totalPot / winners.length);

  const payouts: Record<string, number> = {};
  winners.forEach(winner => {
    payouts[winner.playerId] = winnerPayout;
  });

  return { winners, results, payouts };
};

// Nassau scoring (front 9, back 9, total)
export const calculateNassauResults = (
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number
): MatchResult => {
  // For Nassau, scores represent total points earned
  const results: PlayerScore[] = players.map(player => {
    const playerId = player.profiles.id;
    const points = scores[playerId] || 0;
    
    return {
      playerId,
      playerName: player.profiles.full_name,
      totalScore: points,
      handicap: player.profiles.handicap,
      points,
      position: 0
    };
  }).sort((a, b) => (b.points || 0) - (a.points || 0));

  // Assign positions
  results.forEach((result, index) => {
    result.position = index + 1;
  });

  const winners = results.filter(r => r.position === 1);
  const totalPot = wagerAmount * players.length;
  const winnerPayout = Math.floor(totalPot / winners.length);

  const payouts: Record<string, number> = {};
  winners.forEach(winner => {
    payouts[winner.playerId] = winnerPayout;
  });

  return { winners, results, payouts };
};

// Skins scoring
export const calculateSkinsResults = (
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number
): MatchResult => {
  const results: PlayerScore[] = players.map(player => {
    const playerId = player.profiles.id;
    const skinsWon = scores[playerId] || 0;
    
    return {
      playerId,
      playerName: player.profiles.full_name,
      totalScore: skinsWon,
      handicap: player.profiles.handicap,
      skinsWon,
      position: 0
    };
  }).sort((a, b) => (b.skinsWon || 0) - (a.skinsWon || 0));

  // Assign positions
  results.forEach((result, index) => {
    result.position = index + 1;
  });

  // In skins, payout is per skin won
  const payouts: Record<string, number> = {};
  results.forEach(result => {
    if (result.skinsWon && result.skinsWon > 0) {
      payouts[result.playerId] = result.skinsWon * wagerAmount;
    }
  });

  const winners = results.filter(r => (r.skinsWon || 0) > 0);

  return { winners, results, payouts };
};

// Scramble/Better Ball scoring (team formats)
export const calculateTeamResults = (
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number,
  teamFormat: string
): MatchResult => {
  // Group players by team
  const teams: Record<number, any[]> = {};
  players.forEach(player => {
    const teamNumber = player.team_number || 1;
    if (!teams[teamNumber]) teams[teamNumber] = [];
    teams[teamNumber].push(player);
  });

  const teamResults = Object.entries(teams).map(([teamNumber, teamPlayers]) => {
    // For team formats, use the best score from the team
    const teamScores = teamPlayers.map(player => scores[player.profiles.id] || 999);
    const bestScore = Math.min(...teamScores);
    
    return {
      teamNumber: parseInt(teamNumber),
      players: teamPlayers,
      score: bestScore,
      playerNames: teamPlayers.map(p => p.profiles.full_name).join(', ')
    };
  }).sort((a, b) => a.score - b.score);

  const results: PlayerScore[] = [];
  const payouts: Record<string, number> = {};
  
  teamResults.forEach((team, index) => {
    const position = index + 1;
    const isWinningTeam = position === 1;
    const teamPayout = isWinningTeam ? Math.floor(wagerAmount * Object.keys(teams).length / team.players.length) : 0;
    
    team.players.forEach(player => {
      results.push({
        playerId: player.profiles.id,
        playerName: player.profiles.full_name,
        totalScore: team.score,
        handicap: player.profiles.handicap,
        position
      });
      
      if (isWinningTeam) {
        payouts[player.profiles.id] = teamPayout;
      }
    });
  });

  const winners = results.filter(r => r.position === 1);

  return { winners, results, payouts };
};

// Main scoring function
export const calculateMatchResults = (
  format: string,
  teamFormat: string,
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number
): MatchResult => {
  console.log('Calculating results for format:', format, 'teamFormat:', teamFormat);
  console.log('Players:', players.length, 'Scores:', scores);

  if (teamFormat === 'teams' && (format === 'scramble' || format === 'better-ball')) {
    return calculateTeamResults(players, scores, wagerAmount, format);
  }

  switch (format) {
    case 'stroke-play':
      return calculateStrokePlayResults(players, scores, wagerAmount);
    case 'match-play':
      return calculateMatchPlayResults(players, scores, wagerAmount);
    case 'nassau':
      return calculateNassauResults(players, scores, wagerAmount);
    case 'skins':
      return calculateSkinsResults(players, scores, wagerAmount);
    case 'scramble':
    case 'better-ball':
      return calculateStrokePlayResults(players, scores, wagerAmount);
    default:
      return calculateStrokePlayResults(players, scores, wagerAmount);
  }
};

// Save match results to database
export const saveMatchResults = async (
  matchId: string,
  results: MatchResult,
  format: string
): Promise<void> => {
  try {
    // Update match status to completed
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        winner_id: results.winners[0]?.playerId
      })
      .eq('id', matchId);

    if (matchError) {
      console.error('Error updating match:', matchError);
      throw matchError;
    }

    // Save individual scores to match_scores table if it exists
    // For now, we'll use the existing hole_scores structure
    for (const result of results.results) {
      const { error: scoreError } = await supabase
        .from('hole_scores')
        .upsert({
          match_id: matchId,
          player_id: result.playerId,
          hole_number: 0, // Use 0 to indicate final score
          score: result.totalScore
        }, {
          onConflict: 'match_id,player_id,hole_number'
        });

      if (scoreError) {
        console.error('Error saving score:', scoreError);
      }
    }

    // Update player credits based on payouts
    for (const [playerId, payout] of Object.entries(results.payouts)) {
      if (payout > 0) {
        const { error: creditError } = await supabase.rpc('add_credits', {
          user_id: playerId,
          amount: payout
        });

        if (creditError) {
          console.error('Error updating credits:', creditError);
        }
      }
    }

    console.log('Match results saved successfully');
  } catch (error) {
    console.error('Error saving match results:', error);
    throw error;
  }
};
