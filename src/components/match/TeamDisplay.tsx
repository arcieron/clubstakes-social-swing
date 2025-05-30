
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';

interface TeamDisplayProps {
  players: any[];
}

export const TeamDisplay = ({ players }: TeamDisplayProps) => {
  // Group players by team
  const teams = players.reduce((acc, player) => {
    const teamNumber = player.team_number || 1;
    if (!acc[teamNumber]) {
      acc[teamNumber] = [];
    }
    acc[teamNumber].push(player);
    return acc;
  }, {} as Record<number, any[]>);

  const teamNumbers = Object.keys(teams).map(Number).sort();

  const getTeamColor = (teamNumber: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-red-100 text-red-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    return colors[(teamNumber - 1) % colors.length];
  };

  const getTeamName = (teamNumber: number) => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    return names[(teamNumber - 1) % names.length];
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-700 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Teams ({teamNumbers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {teamNumbers.map((teamNumber) => (
          <div key={teamNumber} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getTeamColor(teamNumber)}>
                Team {getTeamName(teamNumber)}
              </Badge>
              <span className="text-sm text-gray-500">
                {teams[teamNumber].length} player{teams[teamNumber].length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-2">
              {teams[teamNumber].map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{player.profiles.full_name}</p>
                      <p className="text-xs text-gray-500">Handicap: {player.profiles.handicap}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Team Stats */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Handicap:</span>
                <span className="font-medium">
                  {Math.round(teams[teamNumber].reduce((sum, p) => sum + p.profiles.handicap, 0) / teams[teamNumber].length)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
