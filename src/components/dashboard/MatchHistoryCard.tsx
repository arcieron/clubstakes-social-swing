
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface MatchHistoryCardProps {
  matchHistory: any[];
}

export const MatchHistoryCard = ({ matchHistory }: MatchHistoryCardProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-800">Match History</CardTitle>
        <CardDescription className="text-gray-500">Your recent matches</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {matchHistory.length > 0 ? (
          <div className="space-y-4">
            {matchHistory.map((match) => (
              <div key={match.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{match.format}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(match.match_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {match.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">No Match History</p>
            <p className="text-gray-500">You haven't completed any matches yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
