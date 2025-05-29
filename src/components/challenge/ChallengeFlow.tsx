import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockUsers, mockCourses, mockMatches } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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

  const handleSubmit = () => {
    if (!challengeData.postToFeed && selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one other player or post to feed.",
        variant: "destructive"
      });
      return;
    }

    const course = mockCourses.find(c => c.id === challengeData.courseId);
    
    // Create match object
    const newMatch = {
      id: Date.now().toString(),
      player1Id: user.id,
      player2Id: challengeData.postToFeed ? '' : selectedPlayers[0]?.id || '',
      players: challengeData.postToFeed ? [
        { id: user.id, team: challengeData.teamFormat === 'teams' ? 1 : undefined }
      ] : [
        { id: user.id, team: challengeData.teamFormat === 'teams' ? 1 : undefined },
        ...selectedPlayers
      ],
      format: challengeData.format,
      course: course?.name || '',
      courseId: challengeData.courseId,
      wagerAmount: challengeData.wagerAmount,
      status: challengeData.postToFeed ? 'open' as const : 'pending' as const,
      createdAt: new Date().toISOString(),
      completedAt: '',
      matchDate: challengeData.matchDate,
      teamFormat: challengeData.teamFormat,
      winnerId: '',
      maxPlayers: challengeData.postToFeed ? selectedPlayers.length + 1 : undefined,
      isPublic: challengeData.postToFeed
    };

    mockMatches.push(newMatch);
    
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
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PlayerSelectionStep
            user={user}
            selectedPlayers={selectedPlayers}
            onPlayersChange={setSelectedPlayers}
            onNext={() => setStep(2)}
            allowEmpty={challengeData.postToFeed}
          />
        );

      case 2:
        return (
          <GameDetailsStep
            selectedPlayersCount={selectedPlayers.length}
            challengeData={challengeData}
            onChallengeDataChange={setChallengeData}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        );

      case 3:
        return (
          <TeamAssignmentStep
            user={user}
            selectedPlayers={selectedPlayers}
            onPlayersChange={setSelectedPlayers}
            onBack={() => setStep(2)}
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

      {renderStep()}
    </div>
  );
};
