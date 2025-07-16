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
    
    // Set up realtime subscriptions
    const scoreChannel = supabase
      .channel(`match-scores-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hole_scores',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Real-time score update:', payload);
          handleRealtimeScoreUpdate(payload);
        }
      )
      .subscribe();

    const confirmationChannel = supabase
      .channel(`match-confirmations-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_confirmations',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Real-time confirmation update:', payload);
          handleRealtimeConfirmationUpdate(payload);
        }
      )
      .subscribe();

    const matchChannel = supabase
      .channel(`match-status-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('Real-time match update:', payload);
          if (payload.new?.status === 'completed') {
            toast({
              title: "Match Completed!",
              description: "The match has been completed by all players.",
            });
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(scoreChannel);
      supabase.removeChannel(confirmationChannel);
      supabase.removeChannel(matchChannel);
    };
  }, [matchId, players, match.course_id]);

  const handleRealtimeScoreUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      setHoleScores(prev => prev.map(hole => 
        hole.hole === newRecord.hole_number 
          ? { 
              ...hole, 
              scores: { 
                ...hole.scores, 
                [newRecord.player_id]: newRecord.score || 0 
              } 
            }
          : hole
      ));

      // Show toast notification for other players' score updates
      const player = players.find(p => p.profiles.id === newRecord.player_id);
      if (player) {
        toast({
          title: "Score Updated",
          description: `${player.profiles.full_name} scored ${newRecord.score} on hole ${newRecord.hole_number}`,
        });
      }
    } else if (eventType === 'DELETE') {
      setHoleScores(prev => prev.map(hole => 
        hole.hole === oldRecord.hole_number 
          ? { 
              ...hole, 
              scores: { 
                ...hole.scores, 
                [oldRecord.player_id]: 0 
              } 
            }
          : hole
      ));
    }
  };

  const handleRealtimeConfirmationUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT') {
      setConfirmations(prev => ({
        ...prev,
        [newRecord.player_id]: true
      }));

      // Show toast notification for confirmations
      const player = players.find(p => p.profiles.id === newRecord.player_id);
      if (player) {
        toast({
          title: "Scorecard Confirmed",
          description: `${player.profiles.full_name} has confirmed their scorecard`,
        });
      }
    } else if (eventType === 'DELETE') {
      setConfirmations(prev => {
        const updated = { ...prev };
        delete updated[oldRecord.player_id];
        return updated;
      });
    }
  };

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
