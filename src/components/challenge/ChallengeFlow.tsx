
import { PlayerSelectionStep } from './PlayerSelectionStep';
import { GameDetailsStep } from './GameDetailsStep';
import { ChallengeHeader } from './ChallengeHeader';
import { ChallengeProgress } from './ChallengeProgress';
import { useChallengeFlow } from '@/hooks/useChallengeFlow';

interface ChallengeFlowProps {
  user: any;
  onClose: () => void;
}

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const {
    step,
    setStep,
    selectedPlayers,
    setSelectedPlayers,
    challengeData,
    setChallengeData,
    handleSubmit
  } = useChallengeFlow(user, onClose);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <GameDetailsStep
            selectedPlayersCount={selectedPlayers.length}
            challengeData={challengeData}
            onChallengeDataChange={setChallengeData}
            onBack={onClose}
            onNext={() => setStep(2)}
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
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <ChallengeHeader onClose={onClose} />
      
      <ChallengeProgress 
        step={step} 
        teamFormat={challengeData.teamFormat} 
        playersCount={selectedPlayers.length} 
      />

      {renderStep()}
    </div>
  );
};
