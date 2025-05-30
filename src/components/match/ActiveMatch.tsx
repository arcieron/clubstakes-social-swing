
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Trophy, MapPin, Calendar } from 'lucide-react';
import { ScoreInput } from './ScoreInput';
import { TeamDisplay } from './TeamDisplay';

interface ActiveMatchProps {
  matchId: string;
  onBack: () => void;
}

export const ActiveMatch = ({ matchId, onBack }: ActiveMatchProps) => {
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      // Fetch match details
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          *,
          courses(name, rating, slope),
          profiles!matches_creator_id_fkey(full_name)
        `)
        .eq('id', matchId)
        .single();

      // Fetch match players
      const { data: playersData } = await supabase
        .from('match_players')
        .select(`
          *,
          profiles(id, full_name, handicap)
        `)
        .eq('match_id', matchId);

      setMatch(matchData);
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = (playerId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [playerId]: score
    }));
  };

  const submitScores = async () => {
    // Here you would typically save scores to a scores table
    console.log('Submitting scores:', scores);
    // For now, just show success
    alert('Scores submitted successfully!');
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'match-play': return 'Head-to-head holes won';
      case 'stroke-play': return 'Total strokes taken';
      case 'nassau': return 'Front 9, Back 9, Total';
      case 'scramble': return 'Team best ball';
      case 'better-ball': return 'Best score per hole';
      case 'skins': return 'Holes won outright';
      default: return format;
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading match details...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-4 text-center">
        <p>Match not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const isTeamFormat = match.team_format === 'teams';

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Active Match</h1>
          <p className="text-gray-500 text-sm">{match.courses?.name || 'Course TBD'}</p>
        </div>
      </div>

      {/* Match Info Card */}
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Match Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{match.courses?.name || 'Course TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{new Date(match.match_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{players.length} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{match.wager_amount} credits</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Format:</span>
              <Badge variant="outline" className="text-xs">
                {match.format}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getFormatDescription(match.format)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Players/Teams Display */}
      {isTeamFormat ? (
        <TeamDisplay players={players} />
      ) : (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {players.map((player) => (
              <div key={player.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{player.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">Handicap: {player.profiles.handicap}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Player
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Score Input */}
      <ScoreInput
        players={players}
        format={match.format}
        onScoreUpdate={handleScoreUpdate}
        scores={scores}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          onClick={submitScores}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={Object.keys(scores).length === 0}
        >
          Submit Scores
        </Button>
      </div>
    </div>
  );
};
