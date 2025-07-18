
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useHandicapUpdate = (profileId: string, currentHandicap: number) => {
  const [isEditing, setIsEditing] = useState(false);
  const [handicap, setHandicap] = useState(currentHandicap);
  const [isLoading, setIsLoading] = useState(false);

  const updateHandicap = async (newHandicap: number) => {
    if (newHandicap === currentHandicap) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ handicap: newHandicap })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Handicap Updated",
        description: `Your handicap has been updated to ${newHandicap}`,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating handicap:', error);
      toast({
        title: "Error",
        description: "Failed to update handicap. Please try again.",
        variant: "destructive"
      });
      setHandicap(currentHandicap); // Reset to original value
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    const newHandicap = Math.max(0, Math.min(54, handicap)); // Golf handicaps typically 0-54
    updateHandicap(newHandicap);
  };

  const handleCancel = () => {
    setHandicap(currentHandicap);
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    handicap,
    setHandicap,
    isLoading,
    handleSubmit,
    handleCancel
  };
};
