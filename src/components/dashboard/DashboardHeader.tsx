
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';

interface DashboardHeaderProps {
  profile: any;
  onChallenge: () => void;
}

export const DashboardHeader = ({ profile, onChallenge }: DashboardHeaderProps) => {
  // Generate simple display ID based on id_number
  const getDisplayId = (idNumber: number) => {
    return `rivi${idNumber}`;
  };

  return (
    <Card className="bg-green-600 rounded-xl shadow-sm border border-green-700 p-6">
      <div className="space-y-4 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/d6ad57cb-cf85-45e9-bb86-6efa922d473a.png" 
            alt="ClubStakes Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white">
            {profile?.full_name}
          </h1>
          <p className="text-sm text-green-100 mt-1">
            ID: {profile?.id_number ? getDisplayId(profile.id_number) : 'N/A'}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="text-xl font-bold text-yellow-300">
            {profile?.credits?.toLocaleString() || 0}
          </span>
          <span className="text-sm text-green-100">credits</span>
        </div>
        
        <Button onClick={onChallenge} className="bg-white text-green-600 hover:bg-green-50">
          <Plus className="w-4 h-4 mr-2" />
          New Match
        </Button>
      </div>
    </Card>
  );
};
