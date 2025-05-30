
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  leaderboard: any[];
}

export const DashboardStats = ({ leaderboard }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {leaderboard.length > 0 ? leaderboard[0].wins : 0}
          </p>
          <p className="text-gray-500 text-xs font-medium">Most Wins</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">{leaderboard.length}</p>
          <p className="text-gray-500 text-xs font-medium">Active Players</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">32</p>
          <p className="text-gray-500 text-xs font-medium">Matches Played</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">+12%</p>
          <p className="text-gray-500 text-xs font-medium">Win Rate</p>
        </CardContent>
      </Card>
    </div>
  );
};
