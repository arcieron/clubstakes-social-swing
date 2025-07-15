
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  userConfirmed: boolean;
  loading: boolean;
  confirmedCount: number;
  totalNeeded: number;
  allConfirmed: boolean;
  onConfirmScores: () => void;
}

export const ActionButtons = ({
  userConfirmed,
  loading,
  confirmedCount,
  totalNeeded,
  allConfirmed,
  onConfirmScores
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
        {allConfirmed && (
          <div className="mt-2 text-green-600 font-medium">
            All players confirmed! Match completing automatically...
          </div>
        )}
      </div>
    </div>
  );
};
