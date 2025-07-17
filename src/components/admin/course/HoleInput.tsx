
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface HoleData {
  par: number;
  handicap_rating: number;
  yardage: number | null;
}

interface HoleInputProps {
  holeNumber: number;
  form: UseFormReturn<any>;
  usedHandicaps: Set<number>;
}

export const HoleInput = ({ holeNumber, form, usedHandicaps }: HoleInputProps) => {
  const holeData = form.watch(`holes.${holeNumber - 1}`) as HoleData;
  
  return (
    <div className="grid grid-cols-4 gap-2 items-center py-2 border-b">
      <div className="font-medium text-center">{holeNumber}</div>
      
      <FormField
        control={form.control}
        name={`holes.${holeNumber - 1}.par`}
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Par" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`holes.${holeNumber - 1}.handicap_rating`}
        render={({ field }) => (
          <FormItem>
            <Select 
              onValueChange={(value) => field.onChange(parseInt(value))} 
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="HCP" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((rating) => (
                  <SelectItem 
                    key={rating} 
                    value={rating.toString()}
                    disabled={usedHandicaps.has(rating) && holeData?.handicap_rating !== rating}
                  >
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`holes.${holeNumber - 1}.yardage`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Yards"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
