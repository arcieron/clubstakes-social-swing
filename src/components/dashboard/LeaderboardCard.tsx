
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardCardProps {
  leaderboard: any[];
}

export const LeaderboardCard = ({ leaderboard }: LeaderboardCardProps) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">1st</Badge>;
      case 1:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">2nd</Badge>;
      case 2:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">3rd</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription className="text-gray-500">Top players this season</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {leaderboard.slice(0, 5).map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index < leaderboard.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(index)}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {player.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-500">{player.wins} wins</div>
                </div>
              </div>
              <div className="text-right space-y-1">
                {getRankBadge(index)}
                <div className="text-sm font-medium text-gray-900">
                  {player.credits.toLocaleString()} credits
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
