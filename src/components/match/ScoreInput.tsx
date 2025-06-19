
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, Trophy } from 'lucide-react';
import { calculateMatchResults, saveMatchResults } from '@/utils/scoringUtils';
import { toast } from '@/hooks/use-toast';

interface ScoreInputProps {
  matchId: string;
  players: any[];
  format: string;
  teamFormat: string;
  wagerAmount: number;
  onScoreUpdate: (playerId: string, score: number) => void;
  onMatchComplete: (results: any) => void;
  scores: Record<string, number>;
}

export const ScoreInput = ({ 
  matchId,
  players, 
  format, 
  teamFormat,
  wagerAmount,
  onScoreUpdate, 
  onMatchComplete,
  scores 
}: ScoreInputProps) => {
  const [tempScores, setTempScores] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);

  const handleInputChange = (playerId: string, value: string) => {
    setTempScores(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const handleScoreSubmit = (playerId: string) => {
    const scoreValue = tempScores[playerId];
    if (scoreValue && !isNaN(Number(scoreValue))) {
      onScoreUpdate(playerId, Number(scoreValue));
      setTempScores(prev => ({
        ...prev,
        [playerId]: ''
      }));
    }
  };

  const handleCalculateResults = async () => {
    // Check if all players have scores
    const missingScores = players.filter(player => 
      scores[player.profiles.id] === undefined || scores[player.profiles.id] === 0
    );

    if (missingScores.length > 0) {
      toast({
        title: "Missing Scores",
        description: `Please enter scores for all players before calculating results.`,
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);
    try {
      const results = calculateMatchResults(format, teamFormat, players, scores, wagerAmount);
      
      await saveMatchResults(matchId, results, format);
      
      toast({
        title: "Match Complete!",
        description: `Winners: ${results.winners.map(w => w.playerName).join(', ')}`,
      });

      onMatchComplete(results);
    } catch (error) {
      console.error('Error calculating results:', error);
      toast({
        title: "Error",
        description: "Failed to calculate match results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const getScorePlaceholder = (format: string) => {
    switch (format) {
      case 'stroke-play': return 'Total strokes';
      case 'match-play': return 'Holes won';
      case 'nassau': return 'Nassau points';
      case 'skins': return 'Skins won';
      case 'scramble': return 'Team score';
      case 'better-ball': return 'Best ball score';
      default: return 'Score';
    }
  };

  const getScoreDescription = (format: string) => {
    switch (format) {
      case 'stroke-play': return 'Enter total strokes taken for the round';
      case 'match-play': return 'Enter number of holes won against opponent';
      case 'nassau': return 'Enter total Nassau points (front 9 + back 9 + overall)';
      case 'skins': return 'Enter number of skins won during the round';
      case 'scramble': return 'Enter team score (best ball each hole)';
      case 'better-ball': return 'Enter better ball score for the team';
      default: return 'Enter score for this format';
    }
  };

  const getMaxScore = (format: string) => {
    switch (format) {
      case 'stroke-play': return '150';
      case 'match-play': return '18';
      case 'nassau': return '54'; // 18 points each for front, back, overall
      case 'skins': return '18';
      case 'scramble': return '150';
      case 'better-ball': return '150';
      default: return '100';
    }
  };

  const allScoresEntered = players.every(player => 
    scores[player.profiles.id] !== undefined && scores[player.profiles.id] > 0
  );

  return (
    <Card className="border-accent/20">
      <CardHeader className="bg-accent/5">
        <CardTitle className="text-accent flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Score Entry - {format.replace('-', ' ').toUpperCase()}
          {teamFormat === 'teams' && <Badge variant="outline">Team Play</Badge>}
        </CardTitle>
        <p className="text-sm text-gray-600">{getScoreDescription(format)}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {players.map((player) => (
          <div key={player.id} className="p-4 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800">{player.profiles.full_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Handicap: {player.profiles.handicap}</span>
                  {teamFormat === 'teams' && player.team_number && (
                    <Badge variant="secondary" className="text-xs">
                      Team {player.team_number}
                    </Badge>
                  )}
                </div>
              </div>
              {scores[player.profiles.id] !== undefined && (
                <Badge className="bg-green-100 text-green-800">
                  Score: {scores[player.profiles.id]}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={getScorePlaceholder(format)}
                value={tempScores[player.profiles.id] || ''}
                onChange={(e) => handleInputChange(player.profiles.id, e.target.value)}
                className="flex-1"
                min="0"
                max={getMaxScore(format)}
              />
              <Button
                onClick={() => handleScoreSubmit(player.profiles.id)}
                disabled={!tempScores[player.profiles.id] || isNaN(Number(tempScores[player.profiles.id]))}
                size="sm"
                className="bg-accent hover:bg-accent/90"
              >
                <Target className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {allScoresEntered && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleCalculateResults}
              disabled={calculating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {calculating ? (
                "Calculating Results..."
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Calculate Match Results
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
