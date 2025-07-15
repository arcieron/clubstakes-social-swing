
import { Input } from '@/components/ui/input';

interface ScoreInputProps {
  value: number;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const ScoreInput = ({ value, onChange, onBlur, onKeyDown }: ScoreInputProps) => {
  return (
    <Input
      type="number"
      className="w-12 h-10 text-sm text-center border-primary focus:ring-2 focus:ring-primary"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      min="1"
      max="15"
      autoFocus
      placeholder="0"
    />
  );
};
