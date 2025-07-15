
import { Input } from '@/components/ui/input';
import { useEffect, useRef } from 'react';

interface ScoreInputProps {
  value: number;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const ScoreInput = ({ value, onChange, onBlur, onKeyDown }: ScoreInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <Input
      ref={inputRef}
      type="number"
      className="w-12 h-10 text-sm text-center border-primary focus:ring-2 focus:ring-primary"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onFocus={handleFocus}
      min="1"
      max="15"
      placeholder="0"
      inputMode="numeric"
    />
  );
};
