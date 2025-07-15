
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScoreInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: number) => void;
  currentScore: number;
  parScore: number;
  playerName: string;
  holeNumber: number;
}

export const ScoreInputDialog = ({
  isOpen,
  onClose,
  onSave,
  currentScore,
  parScore,
  playerName,
  holeNumber
}: ScoreInputDialogProps) => {
  const [score, setScore] = useState(currentScore || parScore);

  useEffect(() => {
    if (isOpen) {
      setScore(currentScore || parScore);
    }
  }, [isOpen, currentScore, parScore]);

  const handleIncrement = () => {
    if (score < 15) {
      setScore(score + 1);
    }
  };

  const handleDecrement = () => {
    if (score > 1) {
      setScore(score - 1);
    }
  };

  const handleSave = () => {
    onSave(score);
    onClose();
  };

  const getScoreColor = () => {
    if (score < parScore) return 'text-green-600';
    if (score > parScore) return 'text-red-600';
    return 'text-gray-900';
  };

  const getScoreDescription = () => {
    const diff = score - parScore;
    if (diff === 0) return 'Par';
    if (diff === -1) return 'Birdie';
    if (diff === -2) return 'Eagle';
    if (diff === -3) return 'Albatross';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    if (diff > 2) return `+${diff}`;
    return `${diff}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Score for {playerName} - Hole {holeNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Par {parScore}</p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecrement}
                disabled={score <= 1}
                className="h-12 w-12 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>
                  {score}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {getScoreDescription()}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                disabled={score >= 15}
                className="h-12 w-12 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
