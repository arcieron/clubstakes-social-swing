
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

interface ProfileData {
  id: string;
  full_name: string;
  id_number: number;
  handicap: number;
  credits: number;
  club_id: string;
}

interface PlayerCardProps {
  member: ProfileData;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: (playerId: string) => void;
}

export const PlayerCard = ({ member, isSelected, canSelect, onToggle }: PlayerCardProps) => {
  return (
    <button
      onClick={() => onToggle(member.id)}
      disabled={!canSelect && !isSelected}
      className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
        isSelected 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : canSelect 
            ? 'bg-white hover:bg-primary/5 border-gray-100 hover:border-primary/30' 
            : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {isSelected ? '✓' : <UserPlus className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-gray-800 font-medium">{member.full_name}</p>
              <Badge variant="secondary" className="text-xs">#{member.id_number}</Badge>
            </div>
            <p className="text-gray-500 text-sm">Handicap: {member.handicap}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-primary font-bold">{member.credits.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">credits</p>
        </div>
      </div>
    </button>
  );
};
