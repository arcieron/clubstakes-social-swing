
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export const useScorecardData = (matchId: string, match: any, players: any[]) => {
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [holesData, setHolesData] = useState<HoleData[]>([]);
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchHolesData();
    fetchExistingScores();
    fetchConfirmations();
  }, [matchId, players, match.course_id]);

  const fetchHolesData = async () => {
    if (!match.course_id) {
      const standardPars = [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5];
      const fallbackHoles = Array.from({ length: 18 }, (_, i) => ({
        hole_number: i + 1,
        par: standardPars[i],
        handicap_rating: i + 1
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

  return {
    holeScores,
    setHoleScores,
    holesData,
    confirmations,
    fetchConfirmations
  };
};
