
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  leaderboard: any[];
}

export const DashboardStats = ({ leaderboard }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {leaderboard.length > 0 ? leaderboard[0].wins : 0}
          </p>
          <p className="text-gray-500 text-sm font-medium">Most Wins</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">{leaderboard.length}</p>
          <p className="text-gray-500 text-sm font-medium">Active Players</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">32</p>
          <p className="text-gray-500 text-sm font-medium">Matches Played</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">+12%</p>
          <p className="text-gray-500 text-sm font-medium">Win Rate</p>
        </CardContent>
      </Card>
    </div>
  );
};
