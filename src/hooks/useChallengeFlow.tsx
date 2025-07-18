
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mockUsers } from '@/lib/mockData';

interface Player {
  id: string;
  team?: number;
}

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
  scoringType: 'gross' | 'net';
  skinsCarryover?: boolean;
  holes: 9 | 18;
  teeTime?: string;
}

export const useChallengeFlow = (user: any, onClose: () => void) => {
  const [step, setStep] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [openSpots, setOpenSpots] = useState<{[teamNumber: number]: number}>({});
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: new Date().toISOString().split('T')[0],
    teamFormat: 'individual',
    postToFeed: false,
    scoringType: 'gross',
    holes: 18
  });

  const handleSubmit = async () => {
    // Calculate total open spots - each open spot is for 1 player
    const totalOpenSpots = Object.values(openSpots).reduce((sum, count) => sum + count, 0);
    
    // Allow submission if either posting to feed OR players are selected
    if (!challengeData.postToFeed && selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one other player or post to feed.",
        variant: "destructive"
      });
      return;
    }

    // Validate tee time if posting to feed
    if (challengeData.postToFeed && !challengeData.teeTime) {
      toast({
        title: "Tee time required",
        description: "Please select a tee time when posting to the club feed.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating match with data:', challengeData);
      console.log('Selected players:', selectedPlayers);
      console.log('Open spots:', openSpots);
      console.log('User club_id:', user.club_id);

      // Calculate max players correctly:
      // - Creator (1) + Selected players + Open spots (each open spot = 1 player slot)
      const maxPlayers = 1 + selectedPlayers.length + totalOpenSpots;

      // Determine initial status:
      // - If posting to feed with open spots, status is 'open'
      // - If no open spots (all players selected), status is 'in_progress'
      // - Otherwise, status is 'pending'
      let initialStatus: 'open' | 'in_progress' | 'pending' = 'pending';
      
      if (challengeData.postToFeed && totalOpenSpots > 0) {
        initialStatus = 'open';
      } else if (totalOpenSpots === 0 && selectedPlayers.length > 0) {
        // Match is full, set to in_progress immediately
        initialStatus = 'in_progress';
      }

      console.log('Calculated max_players:', maxPlayers);
      console.log('Initial status:', initialStatus);

      // Create the match in Supabase
      const matchInsert = {
        creator_id: user.id,
        club_id: user.club_id,
        format: challengeData.format as any,
        course_id: challengeData.courseId,
        wager_amount: challengeData.wagerAmount,
        match_date: challengeData.matchDate,
        team_format: challengeData.teamFormat as any,
        status: initialStatus as any,
        is_public: challengeData.postToFeed,
        max_players: maxPlayers,
        holes: challengeData.holes,
        tee_time: challengeData.teeTime
      };

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(matchInsert)
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match:', matchError);
        toast({
          title: "Error creating challenge",
          description: matchError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Match created successfully:', match);

      // Add creator to match_players - always team 1 for team format
      let creatorTeamNumber = null;
      if (challengeData.teamFormat === 'teams') {
        creatorTeamNumber = 1;
      }

      const { error: creatorError } = await supabase
        .from('match_players')
        .insert({
          match_id: match.id,
          player_id: user.id,
          team_number: creatorTeamNumber
        });

      if (creatorError) {
        console.error('Error adding creator to match:', creatorError);
      }

      // Add selected players to match_players with their assigned teams
      if (selectedPlayers.length > 0) {
        const playerInserts = selectedPlayers.map((player) => {
          let teamNumber = null;
          
          if (challengeData.teamFormat === 'teams') {
            // Use the assigned team or default to team 2 if not assigned
            teamNumber = player.team || 2;
          }
          
          return {
            match_id: match.id,
            player_id: player.id,
            team_number: teamNumber
          };
        });

        const { error: playersError } = await supabase
          .from('match_players')
          .insert(playerInserts);

        if (playersError) {
          console.error('Error adding players to match:', playersError);
          toast({
            title: "Error adding players",
            description: playersError.message,
            variant: "destructive"
          });
          return;
        }
      }

      if (challengeData.postToFeed) {
        const spotsText = totalOpenSpots > 0 ? ` with ${totalOpenSpots} open spot${totalOpenSpots > 1 ? 's' : ''}` : '';
        const teeTimeText = challengeData.teeTime ? ` at ${challengeData.teeTime}` : '';
        toast({
          title: "Challenge Posted!",
          description: `Your challenge has been posted to the club feed${spotsText}${teeTimeText} for others to join.`
        });
      } else {
        const playerNames = selectedPlayers.map(p => {
          const player = mockUsers.find(u => u.id === p.id);
          return player?.fullName;
        }).join(', ');
        
        const statusMessage = initialStatus === 'in_progress' 
          ? 'Match is ready to start!' 
          : `${playerNames} ${selectedPlayers.length === 1 ? 'has' : 'have'} been challenged to a match.`;
        
        toast({
          title: initialStatus === 'in_progress' ? "Match Created!" : "Challenge Sent!",
          description: statusMessage
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Unexpected error creating challenge:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the challenge.",
        variant: "destructive"
      });
    }
  };

  return {
    step,
    setStep,
    selectedPlayers,
    setSelectedPlayers,
    openSpots,
    setOpenSpots,
    challengeData,
    setChallengeData,
    handleSubmit
  };
};
