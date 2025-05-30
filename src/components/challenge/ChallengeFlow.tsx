import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockUsers, mockCourses } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlayerSelectionStep } from './PlayerSelectionStep';
import { GameDetailsStep } from './GameDetailsStep';
import { TeamAssignmentStep } from './TeamAssignmentStep';

interface ChallengeFlowProps {
  user: any;
  onClose: () => void;
}

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
}

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const [step, setStep] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: new Date().toISOString().split('T')[0],
    teamFormat: 'individual',
    postToFeed: false
  });

  console.log('ChallengeFlow state:', {
    step,
    challengeData,
    selectedPlayers: selectedPlayers.length,
    needsTeamAssignment: challengeData.teamFormat === 'teams' && !challengeData.postToFeed && selectedPlayers.length > 0
  });

  const handleSubmit = async () => {
    // Allow submission if either posting to feed OR players are selected
    if (!challengeData.postToFeed && selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one other player or post to feed.",
        variant: "destructive"
      });
      return;
    }

    // For team format challenges, check if all players have teams assigned (except for feed posts)
    if (challengeData.teamFormat === 'teams' && !challengeData.postToFeed) {
      const unassignedPlayers = selectedPlayers.filter(p => !p.team);
      if (unassignedPlayers.length > 0) {
        toast({
          title: "Team assignment required",
          description: "Please assign all players to teams before sending the challenge.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      console.log('Creating match with data:', challengeData);
      console.log('Selected players:', selectedPlayers);
      console.log('User club_id:', user.club_id);

      // Create the match in Supabase - use the exact field names from the database schema
      const matchInsert = {
        creator_id: user.id,
        club_id: user.club_id,
        format: challengeData.format as any, // Cast to match the enum type
        course_id: challengeData.courseId,
        wager_amount: challengeData.wagerAmount,
        match_date: challengeData.matchDate,
        team_format: challengeData.teamFormat as any, // Cast to match the enum type
        status: challengeData.postToFeed ? 'open' : 'pending' as any, // Cast to match the enum type
        is_public: challengeData.postToFeed,
        max_players: challengeData.postToFeed ? (selectedPlayers.length > 0 ? selectedPlayers.length + 1 : 8) : undefined
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

      // Add creator to match_players with appropriate team assignment
      let creatorTeamNumber = null;
      if (challengeData.teamFormat === 'teams') {
        // For direct challenges, creator is always team 1
        // For feed posts, creator gets team 1 unless specified otherwise
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

      // Add selected players to match_players with proper team assignments
      if (selectedPlayers.length > 0) {
        const playerInserts = selectedPlayers.map((player) => {
          let teamNumber = null;
          
          if (challengeData.teamFormat === 'teams') {
            if (challengeData.postToFeed) {
              // For feed posts, if no team is manually assigned, leave it null so they can join any team
              teamNumber = player.team || null;
            } else {
              // For direct challenges, use the manually assigned team
              teamNumber = player.team;
            }
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
        toast({
          title: "Challenge Posted!",
          description: "Your challenge has been posted to the club feed for others to join."
        });
      } else {
        const playerNames = selectedPlayers.map(p => {
          const player = mockUsers.find(u => u.id === p.id);
          return player?.fullName;
        }).join(', ');
        
        toast({
          title: "Challenge Sent!",
          description: `${playerNames} ${selectedPlayers.length === 1 ? 'has' : 'have'} been challenged to a match.`
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

  const renderStep = () => {
    console.log('Rendering step:', step);
    
    switch (step) {
      case 1:
        return (
          <GameDetailsStep
            selectedPlayersCount={selectedPlayers.length}
            challengeData={challengeData}
            onChallengeDataChange={setChallengeData}
            onBack={onClose}
            onNext={() => {
              console.log('Moving from step 1 to step 2');
              setStep(2);
            }}
            onSubmit={handleSubmit}
            isFirstStep={true}
          />
        );

      case 2:
        return (
          <PlayerSelectionStep
            user={user}
            selectedPlayers={selectedPlayers}
            onPlayersChange={setSelectedPlayers}
            challengeData={challengeData}
            onBack={() => {
              console.log('Moving from step 2 to step 1');
              setStep(1);
            }}
            onNext={() => {
              console.log('Moving from step 2 to step 3 (team assignment)');
              setStep(3);
            }}
            onSubmit={handleSubmit}
          />
        );

      case 3:
        console.log('Rendering TeamAssignmentStep');
        return (
          <TeamAssignmentStep
            user={user}
            selectedPlayers={selectedPlayers}
            onPlayersChange={setSelectedPlayers}
            challengeData={challengeData}
            onBack={() => {
              console.log('Moving from step 3 to step 2');
              setStep(2);
            }}
            onSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-primary hover:text-primary/80 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Step {step} of 3 | Team Format: {challengeData.teamFormat} | Players: {selectedPlayers.length}
      </div>

      {renderStep()}
    </div>
  );
};
