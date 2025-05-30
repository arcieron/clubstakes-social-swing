
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  user: any;
}

export const Leaderboard = ({ user }: LeaderboardProps) => {
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubMembers();
  }, [user.club_id]);

  const fetchClubMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_id', user.club_id)
        .order('credits', { ascending: false });

      if (error) throw error;
      setClubMembers(data || []);
    } catch (error) {
      console.error('Error fetching club members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (position: number, member: any) => {
    if (position === 0) return { icon: Trophy, color: 'text-accent', label: 'Top Dog' };
    if (position === 1) return { icon: Medal, color: 'text-gray-400', label: 'Runner Up' };
    if (position === 2) return { icon: Award, color: 'text-amber-700', label: 'Bronze' };
    if ((member.credits || 0) > 15000) return { icon: Award, color: 'text-primary', label: 'High Roller' };
    return null;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
              <Trophy className="w-6 h-6 text-accent" />
              Club Rankings
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Season leaderboard for {user.clubs?.name}
            </CardDescription>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {clubMembers.map((member, index) => {
          const badge = getBadge(index, member);
          const isCurrentUser = member.id === user.id;
          
          return (
            <Card 
              key={member.id} 
              className={`border-gray-200 transition-all ${
                isCurrentUser ? 'ring-1 ring-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-accent text-accent-foreground' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-amber-700/80 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isCurrentUser ? 'text-primary' : 'text-gray-800'}`}>
                          {member.full_name}
                          {isCurrentUser && <span className="text-sm ml-1">(You)</span>}
                        </h3>
                        {badge && (
                          <div className="flex items-center gap-1 ml-1">
                            <badge.icon className={`w-4 h-4 ${badge.color}`} />
                            <span className={`text-xs ${badge.color}`}>{badge.label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">Handicap: {member.handicap || 0}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">
                      {(member.credits || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Season Info */}
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <p className="text-gray-600 text-sm">Season ends in 180 days</p>
          <p className="text-primary text-xs mt-1">All members reset to 10,000 credits</p>
        </CardContent>
      </Card>
    </div>
  );
};
