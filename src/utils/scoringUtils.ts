
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  profiles: {
    id: string;
    full_name: string;
    handicap: number;
  };
  team_number?: number;
}

interface ScoreData {
  [playerId: string]: number;
}

interface WinnerResult {
  playerId: string;
  playerName: string;
  teamNumber?: number;
  creditsWon: number;
  score?: number;
  details?: string;
}

interface MatchResults {
  winners: WinnerResult[];
  totalCredits: number;
  format: string;
  summary: string;
}

// Calculate net score for a player on a specific hole
const calculateNetScore = (grossScore: number, playerHandicap: number, holeHandicapRating: number): number => {
  if (!grossScore || !playerHandicap) return grossScore;
  
  // Calculate strokes received on this hole
  const strokesReceived = Math.floor(playerHandicap / 18) + (playerHandicap % 18 >= holeHandicapRating ? 1 : 0);
  return Math.max(grossScore - strokesReceived, 1); // Minimum score of 1
};

// Get hole data for net score calculations
const getHoleData = async (courseId: string) => {
  const { data: holes } = await supabase
    .from('holes')
    .select('hole_number, par, handicap_rating')
    .eq('course_id', courseId)
    .order('hole_number');

  // Fallback to standard data if no course data
  if (!holes || holes.length === 0) {
    const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];
    return Array.from({ length: 18 }, (_, i) => ({
      hole_number: i + 1,
      par: standardPars[i],
      handicap_rating: i + 1
    }));
  }

  return holes;
};

// Calculate total net score for stroke play
const calculateTotalNetScore = async (playerId: string, courseId: string, players: Player[]): Promise<number> => {
  const player = players.find(p => p.profiles.id === playerId);
  if (!player) return 0;

  const holes = await getHoleData(courseId);
  
  // Get all hole scores for this player
  const { data: holeScores } = await supabase
    .from('hole_scores')
    .select('hole_number, score')
    .eq('player_id', playerId);

  if (!holeScores) return 0;

  let totalNetScore = 0;
  
  for (const hole of holes) {
    const holeScore = holeScores.find(hs => hs.hole_number === hole.hole_number);
    if (holeScore && holeScore.score) {
      const netScore = calculateNetScore(holeScore.score, player.profiles.handicap, hole.handicap_rating);
      totalNetScore += netScore;
    }
  }

  return totalNetScore;
};

export const calculateMatchResults = async (
  format: string,
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number,
  scoringType: 'gross' | 'net' = 'gross',
  courseId?: string
): Promise<MatchResults> => {
  
  switch (format) {
    case 'stroke-play':
      return calculateStrokePlayResults(teamFormat, players, scores, wagerAmount, scoringType, courseId);
    
    case 'match-play':
      return calculateMatchPlayResults(teamFormat, players, scores, wagerAmount);
    
    case 'nassau':
      return calculateNassauResults(teamFormat, players, scores, wagerAmount, scoringType, courseId);
    
    case 'skins':
      return calculateSkinsResults(teamFormat, players, scores, wagerAmount, scoringType, courseId);
    
    case 'scramble':
      return calculateScrambleResults(teamFormat, players, scores, wagerAmount);
    
    case 'better-ball':
      return calculateBetterBallResults(teamFormat, players, scores, wagerAmount, scoringType, courseId);
    
    default:
      throw new Error(`Unknown format: ${format}`);
  }
};

const calculateStrokePlayResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number,
  scoringType: 'gross' | 'net',
  courseId?: string
): Promise<MatchResults> => {
  
  let playerScores: { playerId: string; score: number; playerName: string; teamNumber?: number }[] = [];

  if (scoringType === 'net' && courseId) {
    // Calculate net scores using hole-by-hole data
    for (const player of players) {
      const netScore = await calculateTotalNetScore(player.profiles.id, courseId, players);
      playerScores.push({
        playerId: player.profiles.id,
        score: netScore,
        playerName: player.profiles.full_name,
        teamNumber: player.team_number
      });
    }
  } else {
    // Use gross scores
    playerScores = players.map(player => ({
      playerId: player.profiles.id,
      score: scores[player.profiles.id] || 999,
      playerName: player.profiles.full_name,
      teamNumber: player.team_number
    }));
  }

  if (teamFormat === 'teams') {
    // Team stroke play - sum team scores
    const teamScores = new Map<number, { score: number; players: string[]; teamNumber: number }>();
    
    playerScores.forEach(({ score, playerName, teamNumber }) => {
      if (teamNumber) {
        if (!teamScores.has(teamNumber)) {
          teamScores.set(teamNumber, { score: 0, players: [], teamNumber });
        }
        const team = teamScores.get(teamNumber)!;
        team.score += score;
        team.players.push(playerName);
      }
    });

    const sortedTeams = Array.from(teamScores.values()).sort((a, b) => a.score - b.score);
    const winningTeam = sortedTeams[0];
    const creditsPerPlayer = Math.floor(wagerAmount / winningTeam.players.length);

    const winners = winningTeam.players.map(playerName => {
      const player = players.find(p => p.profiles.full_name === playerName)!;
      return {
        playerId: player.profiles.id,
        playerName,
        teamNumber: winningTeam.teamNumber,
        creditsWon: creditsPerPlayer,
        score: winningTeam.score,
        details: `Team ${winningTeam.teamNumber} total: ${winningTeam.score}`
      };
    });

    return {
      winners,
      totalCredits: wagerAmount,
      format: 'stroke-play',
      summary: `Team ${winningTeam.teamNumber} wins with total score of ${winningTeam.score}`
    };
  } else {
    // Individual stroke play
    const sortedPlayers = playerScores.sort((a, b) => a.score - b.score);
    const winner = sortedPlayers[0];

    return {
      winners: [{
        playerId: winner.playerId,
        playerName: winner.playerName,
        creditsWon: wagerAmount,
        score: winner.score,
        details: scoringType === 'net' ? 'Net score' : 'Gross score'
      }],
      totalCredits: wagerAmount,
      format: 'stroke-play',
      summary: `${winner.playerName} wins with ${scoringType} score of ${winner.score}`
    };
  }
};

const calculateMatchPlayResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number
): Promise<MatchResults> => {
  
  if (teamFormat === 'teams') {
    // Team match play - team with most holes won
    const teamHoles = new Map<number, { holes: number; players: string[]; teamNumber: number }>();
    
    players.forEach(player => {
      const holes = scores[player.profiles.id] || 0;
      const teamNumber = player.team_number;
      
      if (teamNumber) {
        if (!teamHoles.has(teamNumber)) {
          teamHoles.set(teamNumber, { holes: 0, players: [], teamNumber });
        }
        const team = teamHoles.get(teamNumber)!;
        team.holes += holes;
        team.players.push(player.profiles.full_name);
      }
    });

    const sortedTeams = Array.from(teamHoles.values()).sort((a, b) => b.holes - a.holes);
    const winningTeam = sortedTeams[0];
    const creditsPerPlayer = Math.floor(wagerAmount / winningTeam.players.length);

    const winners = winningTeam.players.map(playerName => {
      const player = players.find(p => p.profiles.full_name === playerName)!;
      return {
        playerId: player.profiles.id,
        playerName,
        teamNumber: winningTeam.teamNumber,
        creditsWon: creditsPerPlayer,
        score: winningTeam.holes
      };
    });

    return {
      winners,
      totalCredits: wagerAmount,
      format: 'match-play',
      summary: `Team ${winningTeam.teamNumber} wins with ${winningTeam.holes} holes won`
    };
  } else {
    // Individual match play
    const playerHoles = players.map(player => ({
      playerId: player.profiles.id,
      playerName: player.profiles.full_name,
      holes: scores[player.profiles.id] || 0
    })).sort((a, b) => b.holes - a.holes);

    const winner = playerHoles[0];

    return {
      winners: [{
        playerId: winner.playerId,
        playerName: winner.playerName,
        creditsWon: wagerAmount,
        score: winner.holes
      }],
      totalCredits: wagerAmount,
      format: 'match-play',
      summary: `${winner.playerName} wins with ${winner.holes} holes won`
    };
  }
};

const calculateNassauResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number,
  scoringType: 'gross' | 'net',
  courseId?: string
): Promise<MatchResults> => {
  
  // Nassau: 3 separate competitions (front 9, back 9, overall)
  const wagerPerSection = Math.floor(wagerAmount / 3);
  const winners: WinnerResult[] = [];
  
  // For Nassau, scores represent total Nassau points (front + back + overall)
  const playerScores = players.map(player => ({
    playerId: player.profiles.id,
    playerName: player.profiles.full_name,
    points: scores[player.profiles.id] || 0,
    teamNumber: player.team_number
  }));

  if (teamFormat === 'teams') {
    const teamPoints = new Map<number, { points: number; players: string[]; teamNumber: number }>();
    
    playerScores.forEach(({ points, playerName, teamNumber }) => {
      if (teamNumber) {
        if (!teamPoints.has(teamNumber)) {
          teamPoints.set(teamNumber, { points: 0, players: [], teamNumber });
        }
        const team = teamPoints.get(teamNumber)!;
        team.points += points;
        team.players.push(playerName);
      }
    });

    const sortedTeams = Array.from(teamPoints.values()).sort((a, b) => b.points - a.points);
    const winningTeam = sortedTeams[0];
    const creditsPerPlayer = Math.floor(wagerAmount / winningTeam.players.length);

    const teamWinners = winningTeam.players.map(playerName => {
      const player = players.find(p => p.profiles.full_name === playerName)!;
      return {
        playerId: player.profiles.id,
        playerName,
        teamNumber: winningTeam.teamNumber,
        creditsWon: creditsPerPlayer,
        score: winningTeam.points
      };
    });

    winners.push(...teamWinners);
  } else {
    const sortedPlayers = playerScores.sort((a, b) => b.points - a.points);
    const winner = sortedPlayers[0];

    winners.push({
      playerId: winner.playerId,
      playerName: winner.playerName,
      creditsWon: wagerAmount,
      score: winner.points
    });
  }

  return {
    winners,
    totalCredits: wagerAmount,
    format: 'nassau',
    summary: `Nassau winner with ${winners[0].score} total points`
  };
};

const calculateSkinsResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number,
  scoringType: 'gross' | 'net',
  courseId?: string
): Promise<MatchResults> => {
  
  // Skins: Each hole is worth equal credits, winner takes all for each hole
  const creditsPerSkin = Math.floor(wagerAmount / 18);
  
  const playerSkins = players.map(player => ({
    playerId: player.profiles.id,
    playerName: player.profiles.full_name,
    skins: scores[player.profiles.id] || 0,
    teamNumber: player.team_number
  }));

  if (teamFormat === 'teams') {
    const teamSkins = new Map<number, { skins: number; players: string[]; teamNumber: number }>();
    
    playerSkins.forEach(({ skins, playerName, teamNumber }) => {
      if (teamNumber) {
        if (!teamSkins.has(teamNumber)) {
          teamSkins.set(teamNumber, { skins: 0, players: [], teamNumber });
        }
        const team = teamSkins.get(teamNumber)!;
        team.skins += skins;
        team.players.push(playerName);
      }
    });

    const winners: WinnerResult[] = [];
    
    teamSkins.forEach((team) => {
      if (team.skins > 0) {
        const creditsPerPlayer = Math.floor((team.skins * creditsPerSkin) / team.players.length);
        team.players.forEach(playerName => {
          const player = players.find(p => p.profiles.full_name === playerName)!;
          winners.push({
            playerId: player.profiles.id,
            playerName,
            teamNumber: team.teamNumber,
            creditsWon: creditsPerPlayer,
            score: team.skins
          });
        });
      }
    });

    return {
      winners,
      totalCredits: wagerAmount,
      format: 'skins',
      summary: `Skins distributed based on holes won`
    };
  } else {
    const winners: WinnerResult[] = playerSkins
      .filter(player => player.skins > 0)
      .map(player => ({
        playerId: player.playerId,
        playerName: player.playerName,
        creditsWon: player.skins * creditsPerSkin,
        score: player.skins
      }));

    return {
      winners,
      totalCredits: wagerAmount,
      format: 'skins',
      summary: `Skins distributed: ${winners.map(w => `${w.playerName} (${w.score})`).join(', ')}`
    };
  }
};

const calculateScrambleResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number
): Promise<MatchResults> => {
  
  // Scramble is always team format
  const teamScores = new Map<number, { score: number; players: string[]; teamNumber: number }>();
  
  players.forEach(player => {
    const teamNumber = player.team_number;
    if (teamNumber) {
      if (!teamScores.has(teamNumber)) {
        teamScores.set(teamNumber, { 
          score: scores[player.profiles.id] || 999, 
          players: [], 
          teamNumber 
        });
      }
      teamScores.get(teamNumber)!.players.push(player.profiles.full_name);
    }
  });

  const sortedTeams = Array.from(teamScores.values()).sort((a, b) => a.score - b.score);
  const winningTeam = sortedTeams[0];
  const creditsPerPlayer = Math.floor(wagerAmount / winningTeam.players.length);

  const winners = winningTeam.players.map(playerName => {
    const player = players.find(p => p.profiles.full_name === playerName)!;
    return {
      playerId: player.profiles.id,
      playerName,
      teamNumber: winningTeam.teamNumber,
      creditsWon: creditsPerPlayer,
      score: winningTeam.score
    };
  });

  return {
    winners,
    totalCredits: wagerAmount,
    format: 'scramble',
    summary: `Team ${winningTeam.teamNumber} wins scramble with score of ${winningTeam.score}`
  };
};

const calculateBetterBallResults = async (
  teamFormat: string,
  players: Player[],
  scores: ScoreData,
  wagerAmount: number,
  scoringType: 'gross' | 'net',
  courseId?: string
): Promise<MatchResults> => {
  
  if (teamFormat === 'teams') {
    // Better ball team format
    const teamScores = new Map<number, { score: number; players: string[]; teamNumber: number }>();
    
    players.forEach(player => {
      const teamNumber = player.team_number;
      if (teamNumber) {
        const playerScore = scores[player.profiles.id] || 999;
        
        if (!teamScores.has(teamNumber)) {
          teamScores.set(teamNumber, { 
            score: playerScore, 
            players: [player.profiles.full_name], 
            teamNumber 
          });
        } else {
          const team = teamScores.get(teamNumber)!;
          team.score = Math.min(team.score, playerScore); // Better ball = lower score
          team.players.push(player.profiles.full_name);
        }
      }
    });

    const sortedTeams = Array.from(teamScores.values()).sort((a, b) => a.score - b.score);
    const winningTeam = sortedTeams[0];
    const creditsPerPlayer = Math.floor(wagerAmount / winningTeam.players.length);

    const winners = winningTeam.players.map(playerName => {
      const player = players.find(p => p.profiles.full_name === playerName)!;
      return {
        playerId: player.profiles.id,
        playerName,
        teamNumber: winningTeam.teamNumber,
        creditsWon: creditsPerPlayer,
        score: winningTeam.score
      };
    });

    return {
      winners,
      totalCredits: wagerAmount,
      format: 'better-ball',
      summary: `Team ${winningTeam.teamNumber} wins better ball with score of ${winningTeam.score}`
    };
  } else {
    // Individual better ball (lowest score wins)
    return calculateStrokePlayResults(teamFormat, players, scores, wagerAmount, scoringType, courseId);
  }
};

export const saveMatchResults = async (matchId: string, results: MatchResults, format: string) => {
  try {
    // Update match as completed
    const { error: matchError } = await supabase
      .from('matches')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (matchError) throw matchError;

    // Award credits to winners
    for (const winner of results.winners) {
      const { error: creditError } = await supabase.rpc('add_credits', {
        user_id: winner.playerId,
        amount: winner.creditsWon
      });

      if (creditError) {
        console.error('Error awarding credits:', creditError);
      }
    }

    console.log('Match results saved successfully');
  } catch (error) {
    console.error('Error saving match results:', error);
    throw error;
  }
};
