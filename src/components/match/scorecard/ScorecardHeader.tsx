
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';

interface ScorecardHeaderProps {
  match: any;
  isTeamFormat: boolean;
}

export const ScorecardHeader = ({ match, isTeamFormat }: ScorecardHeaderProps) => {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2">
          {isTeamFormat ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
          Shared Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-gray-600">
          {match.courses?.name || 'Course TBD'} • {new Date(match.match_date).toLocaleDateString()}
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline">{match.format}</Badge>
          <Badge variant="outline">{match.wager_amount} credits</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
