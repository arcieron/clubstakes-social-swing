
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Info, Clock } from 'lucide-react';

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
  scoringType: 'gross' | 'net';
  skinsCarryover?: boolean;
  holes: 9 | 18;
  teeTime?: string;
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

interface Course {
  id: string;
  name: string;
  rating: number;
  slope: number;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGameInfo, setShowGameInfo] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, rating, slope')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        console.log('Fetched courses:', data);
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error in fetchCourses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChallengeData = (updates: Partial<ChallengeData>) => {
    onChallengeDataChange({ ...challengeData, ...updates });
  };

  const handleFormatChange = (format: string) => {
    // Auto-set team format for team-based games
    const teamFormats = ['better-ball', 'scramble'];
    const newTeamFormat = teamFormats.includes(format) ? 'teams' : challengeData.teamFormat;
    
    updateChallengeData({ 
      format, 
      teamFormat: newTeamFormat 
    });
  };

  const generateTeeTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const gameTypeDescriptions = {
    'match-play': 'Winner determined by who wins the most holes head-to-head. Each hole is worth 1 point - lowest score wins the hole.',
    'stroke-play': 'Winner has the lowest total score for all 18 holes. Traditional golf scoring.',
    'nassau': 'Three separate bets: front 9, back 9, and overall 18-hole match. Winner of each segment gets the credits.',
    'scramble': 'Team format where all players hit, then play from the best shot. Lowest team score wins.',
    'better-ball': 'Team format using the lowest score from each team on every hole. Lowest total team score wins.',
    'skins': 'Winner of each hole gets the credits for that hole. If tied, credits carry over to next hole.'
  };

  // Can proceed if we have required fields
  const canProceed = challengeData.format && challengeData.courseId && challengeData.matchDate && 
    (!challengeData.postToFeed || challengeData.teeTime);

  const isSkinsGame = challengeData.format === 'skins';
  const isTeamBasedFormat = ['better-ball', 'scramble'].includes(challengeData.format);
  const isNassau = challengeData.format === 'nassau';

  return (
    <TooltipProvider>
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-primary">Game Setup</CardTitle>
          <CardDescription>
            Configure your match details and format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <Label className="flex items-center gap-2">
              Game Type
              <Tooltip open={showGameInfo} onOpenChange={setShowGameInfo}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowGameInfo(!showGameInfo)}
                    className="focus:outline-none"
                  >
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-md p-4 text-left bg-white border shadow-lg z-[100]"
                  sideOffset={8}
                >
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary text-sm mb-2">Game Types Available:</h4>
                    {Object.entries(gameTypeDescriptions).map(([format, description]) => (
                      <div key={format} className="space-y-1">
                        <h5 className="font-medium text-xs capitalize text-gray-900">
                          {format.replace('-', ' ')}
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={challengeData.format} onValueChange={handleFormatChange}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {Object.entries(gameTypeDescriptions).map(([format, description]) => (
                  <SelectItem key={format} value={format}>
                    <div className="flex items-center justify-between w-full">
                      <span className="capitalize">{format.replace('-', ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Course</Label>
            <Select value={challengeData.courseId} onValueChange={(value) => 
              updateChallengeData({ courseId: value })
            }>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder={loading ? "Loading courses..." : "Select course"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.rating}/{course.slope})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isNassau && (
            <div>
              <Label>Number of Holes</Label>
              <ToggleGroup 
                type="single" 
                value={challengeData.holes.toString()} 
                onValueChange={(value) => value && updateChallengeData({ holes: parseInt(value) as 9 | 18 })}
                className="justify-start mt-2"
              >
                <ToggleGroupItem value="9" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  9 Holes
                </ToggleGroupItem>
                <ToggleGroupItem value="18" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  18 Holes
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          <div>
            <Label>Match Date</Label>
            <Input
              type="date"
              value={challengeData.matchDate}
              onChange={(e) => updateChallengeData({ matchDate: e.target.value })}
              className="bg-white border-gray-200"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="scoring-toggle" className="text-sm font-medium">
                  Scoring Type
                </Label>
                <p className="text-xs text-gray-500">
                  {challengeData.scoringType === 'gross' ? 'Raw scores without handicap adjustments' : 'Handicap-adjusted scores'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${challengeData.scoringType === 'gross' ? 'font-medium text-primary' : 'text-gray-500'}`}>
                  Gross
                </span>
                <Switch
                  id="scoring-toggle"
                  checked={challengeData.scoringType === 'net'}
                  onCheckedChange={(checked) => 
                    updateChallengeData({ scoringType: checked ? 'net' : 'gross' })
                  }
                />
                <span className={`text-sm ${challengeData.scoringType === 'net' ? 'font-medium text-primary' : 'text-gray-500'}`}>
                  Net
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              Wager Amount
            </Label>
            <div className="space-y-4">
              <Slider
                value={[challengeData.wagerAmount]}
                onValueChange={(value) => updateChallengeData({ wagerAmount: value[0] })}
                min={100}
                max={1500}
                step={50}
                className="w-full"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{challengeData.wagerAmount}</span>
                <span className="text-accent font-semibold ml-1">credits</span>
              </div>
            </div>
            
            {isSkinsGame && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="skinsCarryover" 
                    checked={challengeData.skinsCarryover || false}
                    onCheckedChange={(checked) => updateChallengeData({ skinsCarryover: !!checked })}
                  />
                  <Label htmlFor="skinsCarryover" className="text-sm">
                    Credits carry over to next hole for ties
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Team Format</Label>
            <RadioGroup 
              value={challengeData.teamFormat} 
              onValueChange={(value) => updateChallengeData({ teamFormat: value })}
              className="flex gap-6 mt-2"
              disabled={isTeamBasedFormat}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="individual" 
                  id="individual" 
                  disabled={isTeamBasedFormat}
                />
                <Label 
                  htmlFor="individual"
                  className={isTeamBasedFormat ? "text-gray-400" : ""}
                >
                  Individual Play
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="teams" 
                  id="teams"
                  disabled={isTeamBasedFormat}
                />
                <Label 
                  htmlFor="teams"
                  className={isTeamBasedFormat ? "text-gray-400" : ""}
                >
                  Team Play
                </Label>
              </div>
            </RadioGroup>
            {isTeamBasedFormat && (
              <p className="text-xs text-gray-500 mt-1">
                Team play is required for {challengeData.format.replace('-', ' ')} format
              </p>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
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
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    When you post to the club feed, other members can join your challenge. 
                    You can still invite specific players in the next step.
                  </p>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tee Time
                  </Label>
                  <Select value={challengeData.teeTime} onValueChange={(value) => 
                    updateChallengeData({ teeTime: value })
                  }>
                    <SelectTrigger className="bg-white border-gray-200 mt-2">
                      <SelectValue placeholder="Select tee time" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60">
                      {generateTeeTimeOptions().map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
    </TooltipProvider>
  );
};
