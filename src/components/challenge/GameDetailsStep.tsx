import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
  skinsCarryover?: boolean;
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

  const gameTypeDescriptions = {
    'match-play': 'Winner determined by who wins the most holes head-to-head. Each hole is worth 1 point - lowest score wins the hole.',
    'stroke-play': 'Winner has the lowest total score for all 18 holes. Traditional golf scoring.',
    'nassau': 'Three separate bets: front 9, back 9, and overall 18-hole match. Winner of each segment gets the credits.',
    'scramble': 'Team format where all players hit, then play from the best shot. Lowest team score wins.',
    'better-ball': 'Team format using the lowest score from each team on every hole. Lowest total team score wins.',
    'skins': 'Winner of each hole gets the credits for that hole. If tied, credits carry over to next hole.'
  };

  // Can proceed if we have required fields
  const canProceed = challengeData.format && challengeData.courseId && challengeData.matchDate;

  const isSkinsGame = challengeData.format === 'skins';
  const isTeamBasedFormat = ['better-ball', 'scramble'].includes(challengeData.format);

  return (
    <TooltipProvider delayDuration={300}>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  align="start"
                  className="max-w-sm bg-white border border-gray-200 shadow-lg p-3 z-50"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {challengeData.format ? gameTypeDescriptions[challengeData.format as keyof typeof gameTypeDescriptions] : 'Select a game type to see how winners are calculated'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={challengeData.format} onValueChange={handleFormatChange}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="match-play">
                  <div className="flex items-center justify-between w-full">
                    <span>Match Play</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['match-play']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
                <SelectItem value="stroke-play">
                  <div className="flex items-center justify-between w-full">
                    <span>Stroke Play</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['stroke-play']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
                <SelectItem value="nassau">
                  <div className="flex items-center justify-between w-full">
                    <span>Nassau</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['nassau']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
                <SelectItem value="scramble">
                  <div className="flex items-center justify-between w-full">
                    <span>Scramble</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['scramble']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
                <SelectItem value="better-ball">
                  <div className="flex items-center justify-between w-full">
                    <span>Better Ball</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['better-ball']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
                <SelectItem value="skins">
                  <div className="flex items-center justify-between w-full">
                    <span>Skins</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-xs bg-white border border-gray-200 shadow-lg p-3 z-[60]"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">{gameTypeDescriptions['skins']}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
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
            <Label>
              Wager Amount{isSkinsGame && <span className="text-sm text-gray-600 ml-1">(per hole)</span>}
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
    </TooltipProvider>
  );
};
