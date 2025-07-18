
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X } from 'lucide-react';
import { useHandicapUpdate } from '@/hooks/useHandicapUpdate';

interface HandicapEditorProps {
  profileId: string;
  currentHandicap: number;
  onUpdate?: (newHandicap: number) => void;
}

export const HandicapEditor = ({ profileId, currentHandicap, onUpdate }: HandicapEditorProps) => {
  const {
    isEditing,
    setIsEditing,
    handicap,
    setHandicap,
    isLoading,
    handleSubmit,
    handleCancel
  } = useHandicapUpdate(profileId, currentHandicap);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">HCP:</span>
        <Input
          type="number"
          value={handicap}
          onChange={(e) => setHandicap(Number(e.target.value))}
          className="w-16 h-7 text-sm"
          min="0"
          max="54"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSubmit}
          disabled={isLoading}
          className="h-7 w-7 p-0"
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-7 w-7 p-0"
        >
          <X className="w-3 h-3 text-gray-500" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
    >
      <span>HCP: {currentHandicap}</span>
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
