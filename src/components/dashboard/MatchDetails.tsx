
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Trophy, MapPin, Calendar, Crown } from 'lucide-react';
import { CompletedScorecard } from './CompletedScorecard';

interface MatchDetailsProps {
  match: any;
  onBack: () => void;
}

export const MatchDetails = ({ match, onBack }: MatchDetailsProps) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [holeScores, setHoleScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [match.id]);

  const fetchMatchDetails = async () => {
    try {
      // Fetch match players
      const { data: playersData } = await supabase
        .from('match_players')
        .select(`
          *,
          profiles(id, full_name, handicap)
        `)
        .eq('match_id', match.id);

      // Fetch hole scores
      const { data: scoresData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('match_id', match.id)
        .order('hole_number');

      setPlayers(playersData || []);
      setHoleScores(scoresData || []);
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatGameType = (format: string) => {
    switch (format) {
      case 'match-play': return 'Match Play';
      case 'stroke-play': return 'Stroke Play';
      case 'nassau': return 'Nassau';
      case 'scramble': return 'Scramble';
      case 'better-ball': return 'Better Ball';
      case 'skins': return 'Skins';
      default: return format;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Match Details</h1>
          <p className="text-gray-500">{new Date(match.match_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Match Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              {formatGameType(match.format)}
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{match.courses?.name || 'Course TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {match.completed_at 
                  ? new Date(match.completed_at).toLocaleDateString()
                  : new Date(match.match_date).toLocaleDateString()
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{match.wager_amount.toLocaleString()} credits</span>
            </div>
          </div>

          {match.winner_profile ? (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                Winner: {match.winner_profile.full_name}
              </span>
            </div>
          ) : match.status === 'completed' ? (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Crown className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">
                Result: TIE
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Scorecard */}
      {players.length > 0 ? (
        <CompletedScorecard 
          match={match}
          players={players}
          holeScores={holeScores}
        />
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Players Found</h3>
            <p className="text-gray-600">Unable to load player data for this match</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
