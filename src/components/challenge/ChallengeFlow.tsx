
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

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const [step, setStep] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [challengeData, setChallengeData] = useState({
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: new Date().toISOString().split('T')[0], // Auto-fill with current date
    teamFormat: 'individual' // 'individual' or 'teams'
  });

  const handleSubmit = () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one other player.",
        variant: "destructive"
      });
      return;
    }

    const course = mockCourses.find(c => c.id === challengeData.courseId);
    
    // Create match object compatible with existing mock data structure
    const newMatch = {
      id: Date.now().toString(),
      player1Id: user.id,
      player2Id: selectedPlayers[0].id, // For compatibility, set first player as player2
      players: [
        { id: user.id, team: challengeData.teamFormat === 'teams' ? 1 : undefined },
        ...selectedPlayers
      ],
      format: challengeData.format,
      course: course?.name || '',
      wagerAmount: challengeData.wagerAmount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      matchDate: challengeData.matchDate,
      teamFormat: challengeData.teamFormat,
      winnerId: '',
      completedAt: ''
    };

    mockMatches.push(newMatch);
    
    const playerNames = selectedPlayers.map(p => {
      const player = mockUsers.find(u => u.id === p.id);
      return player?.fullName;
    }).join(', ');
    
    toast({
      title: "Challenge Sent!",
      description: `${playerNames} ${selectedPlayers.length === 1 ? 'has' : 'have'} been challenged to a match.`
    });
    
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
