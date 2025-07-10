
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
      className="w-8 h-8 text-xs text-center p-0 border-primary"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      min="1"
      max="15"
      autoFocus
    />
  );
};
