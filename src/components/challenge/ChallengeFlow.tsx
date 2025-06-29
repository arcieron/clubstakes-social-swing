
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
    openSpots,
    setOpenSpots,
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
            openSpots={openSpots}
            onOpenSpotsChange={setOpenSpots}
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

  const totalOpenSpots = Object.values(openSpots).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-4">
      <ChallengeHeader onClose={onClose} />
      
      <ChallengeProgress 
        step={step} 
        teamFormat={challengeData.teamFormat} 
        playersCount={selectedPlayers.length + 1 + totalOpenSpots} 
      />

      {renderStep()}
    </div>
  );
};
