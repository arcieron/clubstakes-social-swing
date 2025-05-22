
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockUsers } from '@/lib/mockData';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  user: any;
}

export const Leaderboard = ({ user }: LeaderboardProps) => {
  const clubMembers = mockUsers
    .filter(u => u.clubId === user.clubId)
    .sort((a, b) => b.credits - a.credits);

  const getBadge = (position: number, member: any) => {
    if (position === 0) return { icon: Trophy, color: 'text-yellow-500', label: 'Top Dog' };
    if (position === 1) return { icon: Medal, color: 'text-gray-400', label: 'Runner Up' };
    if (position === 2) return { icon: Award, color: 'text-amber-600', label: 'Bronze' };
    if (member.credits > 15000) return { icon: Award, color: 'text-green-400', label: 'High Roller' };
    return null;
  };

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-gray-800 border-green-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Club Rankings
          </CardTitle>
          <CardDescription className="text-green-200">
            Season leaderboard for {user.clubName}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {clubMembers.map((member, index) => {
          const badge = getBadge(index, member);
          const isCurrentUser = member.id === user.id;
          
          return (
            <Card 
              key={member.id} 
              className={`bg-gray-800 border-green-700 transition-all ${
                isCurrentUser ? 'ring-2 ring-green-500 bg-green-900/20' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-900' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                          {member.fullName}
                          {isCurrentUser && <span className="text-sm">(You)</span>}
                        </h3>
                        {badge && (
                          <div className="flex items-center gap-1">
                            <badge.icon className={`w-4 h-4 ${badge.color}`} />
                            <span className={`text-xs ${badge.color}`}>{badge.label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">Handicap: {member.handicap}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {member.credits.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Season Info */}
      <Card className="bg-gray-800 border-green-700">
        <CardContent className="p-4 text-center">
          <p className="text-gray-400 text-sm">Season ends in 180 days</p>
          <p className="text-green-400 text-xs mt-1">All members reset to 10,000 credits</p>
        </CardContent>
      </Card>
    </div>
  );
};
