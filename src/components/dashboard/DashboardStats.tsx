
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  leaderboard: any[];
}

export const DashboardStats = ({ leaderboard }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {leaderboard.length > 0 ? leaderboard[0].wins : 0}
          </p>
          <p className="text-gray-500 text-sm">Most Wins</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{leaderboard.length}</p>
          <p className="text-gray-500 text-sm">Total Players</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">32</p>
          <p className="text-gray-500 text-sm">Matches Played</p>
        </CardContent>
      </Card>
    </div>
  );
};
