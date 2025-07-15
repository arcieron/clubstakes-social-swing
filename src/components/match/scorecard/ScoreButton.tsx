
import { Button } from '@/components/ui/button';

interface ScoreButtonProps {
  score: number;
  onClick: () => void;
}

export const ScoreButton = ({ score, onClick }: ScoreButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-12 h-10 text-sm font-medium hover:bg-primary/10 border border-gray-200 cursor-pointer"
      type="button"
    >
      {score || '-'}
    </Button>
  );
};
