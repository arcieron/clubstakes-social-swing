
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
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
  isFirstStep?: boolean;
}

export const GameDetailsStep = ({ 
  selectedPlayersCount, 
  challengeData, 
  onChallengeDataChange, 
  onBack, 
  onNext, 
  onSubmit,
  isFirstStep = false
}: GameDetailsStepProps) => {
  const updateChallengeData = (updates: Partial<ChallengeData>) => {
    onChallengeDataChange({ ...challengeData, ...updates });
  };

  // Can proceed if we have required fields
  const canProceed = challengeData.format && challengeData.courseId && challengeData.matchDate;

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary">Game Setup</CardTitle>
        <CardDescription>
          Configure your match details and format
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
          <Label>Match Date</Label>
          <Input
            type="date"
            value={challengeData.matchDate}
            onChange={(e) => updateChallengeData({ matchDate: e.target.value })}
            className="bg-white border-gray-200"
          />
        </div>

        <div className="space-y-3">
          <Label>Wager Amount</Label>
          <div className="space-y-4">
            <Slider
              value={[challengeData.wagerAmount]}
              onValueChange={(value) => updateChallengeData({ wagerAmount: value[0] })}
              min={100}
              max={1500}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">100 credits</span>
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{challengeData.wagerAmount}</span>
                <span className="text-accent font-semibold ml-1">credits</span>
              </div>
              <span className="text-sm text-gray-500">1,500 credits</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Team Format</Label>
          <RadioGroup 
            value={challengeData.teamFormat} 
            onValueChange={(value) => updateChallengeData({ teamFormat: value })}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Individual Play</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="teams" id="teams" />
              <Label htmlFor="teams">Team Play</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
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
          
          {challengeData.postToFeed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-blue-800">
                When you post to the club feed, other members can join your challenge. 
                You can still invite specific players in the next step.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            {isFirstStep ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Next: Select Players
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
