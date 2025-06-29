
interface ChallengeProgressProps {
  step: number;
  teamFormat: string;
  playersCount: number;
}

export const ChallengeProgress = ({ step, teamFormat, playersCount }: ChallengeProgressProps) => {
  return (
    <div className="mb-4 text-sm text-gray-500">
      Step {step} of 2 | Team Format: {teamFormat} | Players: {playersCount}
    </div>
  );
};
