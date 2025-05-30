
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PlayerSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PlayerSearchInput = ({ searchTerm, onSearchChange }: PlayerSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Search members by name or ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white border-gray-200"
      />
    </div>
  );
};
