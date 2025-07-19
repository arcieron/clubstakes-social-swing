
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NineHoleSelectorProps {
  selectedNine: 'front' | 'back';
  onNineChange: (nine: 'front' | 'back') => void;
}

export const NineHoleSelector = ({ selectedNine, onNineChange }: NineHoleSelectorProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-700">Playing:</span>
          <div className="flex gap-1">
            <Button
              variant={selectedNine === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNineChange('front')}
            >
              Front 9
            </Button>
            <Button
              variant={selectedNine === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNineChange('back')}
            >
              Back 9
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
