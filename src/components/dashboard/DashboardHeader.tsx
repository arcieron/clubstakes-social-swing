
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { HandicapEditor } from './HandicapEditor';

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
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {profile?.full_name}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-sm text-gray-500">
              ID: {profile?.id_number ? getDisplayId(profile.id_number) : 'N/A'}
            </p>
            {profile && (
              <HandicapEditor
                profileId={profile.id}
                currentHandicap={profile.handicap || 0}
              />
            )}
          </div>
          <p className="text-sm text-primary font-medium mt-1">
            {profile?.clubs?.name}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-xl font-bold text-primary">
            {profile?.credits?.toLocaleString() || 0}
          </span>
          <span className="text-sm text-gray-500">credits</span>
        </div>
        
        <Button onClick={onChallenge} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Match
        </Button>
      </div>
    </Card>
  );
};
