
import { FormLabel } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseFormReturn } from 'react-hook-form';
import { HoleInput } from './HoleInput';
import { useMemo } from 'react';

interface HolesSectionProps {
  form: UseFormReturn<any>;
}

export const HolesSection = ({ form }: HolesSectionProps) => {
  const holes = form.watch('holes') || [];
  
  const usedHandicaps = useMemo(() => {
    const used = new Set<number>();
    holes.forEach((hole: any) => {
      if (hole?.handicap_rating) {
        used.add(hole.handicap_rating);
      }
    });
    return used;
  }, [holes]);

  return (
    <div className="space-y-4">
      <FormLabel className="text-base font-semibold">Course Holes</FormLabel>
      <div className="border rounded-lg">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 items-center py-3 px-3 bg-gray-50 font-semibold border-b">
          <div className="text-center">Hole</div>
          <div className="text-center">Par</div>
          <div className="text-center">Handicap</div>
          <div className="text-center">Yardage</div>
        </div>
        
        {/* Holes List */}
        <ScrollArea className="h-[400px]">
          <div className="px-3">
            {Array.from({ length: 18 }, (_, i) => (
              <HoleInput 
                key={i + 1}
                holeNumber={i + 1}
                form={form}
                usedHandicaps={usedHandicaps}
              />
            ))}
          </div>
        </ScrollArea>
        
        {/* Summary */}
        <div className="px-3 py-2 bg-gray-50 border-t text-sm text-gray-600">
          {usedHandicaps.size}/18 handicap ratings assigned
        </div>
      </div>
    </div>
  );
};
