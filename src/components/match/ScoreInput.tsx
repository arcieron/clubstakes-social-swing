
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ScoreInputProps {
  matchId: string;
  players: any[];
  format: string;
  teamFormat: string;
  wagerAmount: number;
  scoringType?: 'gross' | 'net';
  courseId?: string;
  onScoreUpdate: (playerId: string, score: number) => void;
  onMatchComplete: (results: any) => void;
  scores: Record<string, number>;
}

export const ScoreInput = (props: ScoreInputProps) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Score Entry Disabled
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700">
          This simplified score entry system has been disabled in favor of the proper hole-by-hole scorecard system. 
          Please use the scorecard view for accurate golf scoring with proper handicapping and game format calculations.
        </p>
      </CardContent>
    </Card>
  );
};
