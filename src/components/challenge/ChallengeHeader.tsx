
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ChallengeHeaderProps {
  onClose: () => void;
}

export const ChallengeHeader = ({ onClose }: ChallengeHeaderProps) => {
  return (
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
  );
};
