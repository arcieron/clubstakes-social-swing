import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { mockCourses } from '@/lib/mockData';

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
}

interface GameDetailsStepProps {
  selectedPlayersCount: number;
  challengeData: ChallengeData;
  onChallengeDataChange: (data: ChallengeData) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const GameDetailsStep = ({ 
  selectedPlayersCount, 
  challengeData, 
  onChallengeDataChange, 
  onBack, 
  onNext, 
  onSubmit 
}: GameDetailsStepProps) => {
  const totalPlayers = selectedPlayersCount + 1;

  const updateChallengeData = (updates: Partial<ChallengeData>) => {
    onChallengeDataChange({ ...challengeData, ...updates });
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary">Game Details</CardTitle>
        <CardDescription>
          {totalPlayers} players selected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <Label>Game Type</Label>
          <Select value={challengeData.format} onValueChange={(value) => 
            updateChallengeData({ format: value })
          }>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match-play">Match Play</SelectItem>
              <SelectItem value="stroke-play">Stroke Play</SelectItem>
              <SelectItem value="nassau">Nassau</SelectItem>
              <SelectItem value="scramble">Scramble</SelectItem>
              <SelectItem value="better-ball">Better Ball</SelectItem>
              <SelectItem value="skins">Skins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {totalPlayers >= 4 && (
          <div>
            <Label>Format</Label>
            <RadioGroup 
              value={challengeData.teamFormat} 
              onValueChange={(value) => updateChallengeData({ teamFormat: value })}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Individual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teams" id="teams" />
                <Label htmlFor="teams">Teams</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div>
          <Label>Course</Label>
          <Select value={challengeData.courseId} onValueChange={(value) => 
            updateChallengeData({ courseId: value })
          }>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {mockCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} ({course.rating}/{course.slope})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Wager Amount</Label>
          <Input
            type="number"
            min="100"
            max="1000"
            step="50"
            value={challengeData.wagerAmount}
            onChange={(e) => updateChallengeData({ wagerAmount: parseInt(e.target.value) })}
            className="bg-white border-gray-200"
          />
          <p className="text-xs text-gray-400 mt-1">Range: 100 - 1,000 credits</p>
        </div>

        <div>
          <Label>Match Date</Label>
          <Input
            type="date"
            value={challengeData.matchDate}
            onChange={(e) => updateChallengeData({ matchDate: e.target.value })}
            className="bg-white border-gray-200"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="postToFeed" 
            checked={challengeData.postToFeed}
            onCheckedChange={(checked) => updateChallengeData({ postToFeed: !!checked })}
          />
          <Label htmlFor="postToFeed" className="text-sm">
            Post to club feed for others to join
          </Label>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            Back
          </Button>
          <Button 
            onClick={() => challengeData.teamFormat === 'teams' && !challengeData.postToFeed ? onNext() : onSubmit()}
            disabled={!challengeData.format || !challengeData.courseId || !challengeData.matchDate}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {challengeData.teamFormat === 'teams' && !challengeData.postToFeed ? 'Next: Teams' : 'Send Challenge'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
