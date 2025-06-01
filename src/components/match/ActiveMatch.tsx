
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Trophy, MapPin, Calendar } from 'lucide-react';
import { Scorecard } from './Scorecard';

interface ActiveMatchProps {
  matchId: string;
  onBack: () => void;
}

export const ActiveMatch = ({ matchId, onBack }: ActiveMatchProps) => {
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
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

  const handleSubmitScores = () => {
    // Navigate back to dashboard or show completion message
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Match not found</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sticky top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 bg-white shadow-sm border"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="bg-white rounded-lg shadow-sm border px-4 py-2 flex-1">
            <h1 className="font-bold text-gray-800">{match.courses?.name || 'Golf Match'}</h1>
            <p className="text-sm text-gray-500">{new Date(match.match_date).toLocaleDateString()}</p>
          </div>
        </div>

        {players.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Players in Match</h3>
              <p className="text-gray-600 mb-4">Players need to be added from the challenge creation flow</p>
            </CardContent>
          </Card>
        ) : (
          <Scorecard 
            matchId={matchId}
            match={match}
            players={players}
            onSubmitScores={handleSubmitScores}
          />
        )}
      </div>
    </div>
  );
};
