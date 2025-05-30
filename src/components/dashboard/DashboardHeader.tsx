
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';

interface DashboardHeaderProps {
  profile: any;
}

export const DashboardHeader = ({ profile }: DashboardHeaderProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-white to-accent/10 rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 font-medium">{profile?.clubs?.name}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {profile?.credits?.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-gray-500">Available Credits</div>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1" />
            New Match
          </Button>
        </div>
      </div>
    </Card>
  );
};
