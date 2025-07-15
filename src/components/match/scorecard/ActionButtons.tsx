
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  userConfirmed: boolean;
  loading: boolean;
  confirmedCount: number;
  totalNeeded: number;
  allConfirmed: boolean;
  onConfirmScores: () => void;
  onCompleteMatch: () => void;
}

export const ActionButtons = ({
  userConfirmed,
  loading,
  confirmedCount,
  totalNeeded,
  allConfirmed,
  onConfirmScores,
  onCompleteMatch
}: ActionButtonsProps) => {
  return (
    <div className="space-y-3 pt-4">
      <Button 
        onClick={onConfirmScores}
        disabled={loading || userConfirmed}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        {userConfirmed ? 'Scorecard Confirmed ✓' : loading ? 'Confirming...' : 'Confirm Scorecard'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        {confirmedCount} of {totalNeeded} players have confirmed their scorecard
      </div>

      {allConfirmed && (
        <Button 
          onClick={onCompleteMatch}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          Complete Match & Distribute Credits
        </Button>
      )}
    </div>
  );
};
