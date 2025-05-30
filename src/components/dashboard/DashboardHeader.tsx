
import { Card } from '@/components/ui/card';

interface DashboardHeaderProps {
  profile: any;
}

export const DashboardHeader = ({ profile }: DashboardHeaderProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {profile?.full_name}!</h1>
          <p className="text-gray-600 mt-1">{profile?.clubs?.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{profile?.credits?.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Available Credits</div>
        </div>
      </div>
    </Card>
  );
};
