
// This file is deprecated in favor of the scorecard system
// The scorecard system in useScorecardActions.tsx provides proper hole-by-hole scoring

export const calculateMatchResults = async (
  format: string,
  teamFormat: string,
  players: any[],
  scores: Record<string, number>,
  wagerAmount: number,
  scoringType: 'gross' | 'net' = 'gross',
  courseId?: string
) => {
  console.warn('This simplified scoring system is deprecated. Use the scorecard system instead.');
  
  // Return a basic result to prevent errors
  return {
    winners: players.slice(0, 1).map(player => ({
      playerId: player.profiles.id,
      playerName: player.profiles.full_name,
      score: scores[player.profiles.id] || 0
    })),
    format,
    teamFormat,
    scoringType
  };
};

export const saveMatchResults = async (
  matchId: string,
  results: any,
  format: string
) => {
  console.warn('This simplified scoring system is deprecated. Use the scorecard system instead.');
  // Do nothing to prevent interference with the proper scorecard system
};

// Export functions for backward compatibility but mark as deprecated
export const calculateStrokePlayResults = () => {
  throw new Error('Use the scorecard system for proper stroke play calculation');
};

export const calculateMatchPlayResults = () => {
  throw new Error('Use the scorecard system for proper match play calculation');
};

export const calculateNassauResults = () => {
  throw new Error('Use the scorecard system for proper Nassau calculation');
};

export const calculateSkinsResults = () => {
  throw new Error('Use the scorecard system for proper skins calculation');
};

export const calculateScrambleResults = () => {
  throw new Error('Use the scorecard system for proper scramble calculation');
};

export const calculateBetterBallResults = () => {
  throw new Error('Use the scorecard system for proper better ball calculation');
};
