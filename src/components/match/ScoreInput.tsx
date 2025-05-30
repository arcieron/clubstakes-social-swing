
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target } from 'lucide-react';

interface ScoreInputProps {
  players: any[];
  format: string;
  onScoreUpdate: (playerId: string, score: number) => void;
  scores: Record<string, number>;
}

export const ScoreInput = ({ players, format, onScoreUpdate, scores }: ScoreInputProps) => {
  const [tempScores, setTempScores] = useState<Record<string, string>>({});

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

  const getScorePlaceholder = (format: string) => {
    switch (format) {
      case 'stroke-play': return 'Total strokes';
      case 'match-play': return 'Holes won';
      case 'nassau': return 'Points';
      case 'skins': return 'Skins won';
      case 'scramble': return 'Team score';
      case 'better-ball': return 'Best ball score';
      default: return 'Score';
    }
  };

  const getScoreDescription = (format: string) => {
    switch (format) {
      case 'stroke-play': return 'Enter total strokes taken for the round';
      case 'match-play': return 'Enter number of holes won';
      case 'nassau': return 'Enter points for front 9, back 9, and total';
      case 'skins': return 'Enter number of skins won';
      case 'scramble': return 'Enter team score (lowest ball each hole)';
      case 'better-ball': return 'Enter better ball score';
      default: return 'Enter score for this format';
    }
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="bg-accent/5">
        <CardTitle className="text-accent flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Score Entry - {format.replace('-', ' ').toUpperCase()}
        </CardTitle>
        <p className="text-sm text-gray-600">{getScoreDescription(format)}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {players.map((player) => (
          <div key={player.id} className="p-4 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800">{player.profiles.full_name}</p>
                <p className="text-sm text-gray-500">Handicap: {player.profiles.handicap}</p>
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
                max={format === 'stroke-play' ? '150' : format === 'match-play' ? '18' : '100'}
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
      </CardContent>
    </Card>
  );
};
