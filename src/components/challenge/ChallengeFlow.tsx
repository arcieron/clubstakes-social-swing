
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUsers, mockCourses, mockMatches } from '@/lib/mockData';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChallengeFlowProps {
  user: any;
  onClose: () => void;
}

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const [step, setStep] = useState(1);
  const [challengeData, setChallengeData] = useState({
    opponentId: '',
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: ''
  });

  const clubMembers = mockUsers.filter(u => u.clubId === user.clubId && u.id !== user.id);

  const handleSubmit = () => {
    const opponent = mockUsers.find(u => u.id === challengeData.opponentId);
    const course = mockCourses.find(c => c.id === challengeData.courseId);
    
    const newMatch = {
      id: Date.now().toString(),
      player1Id: user.id,
      player2Id: challengeData.opponentId,
      format: challengeData.format,
      course: course?.name || '',
      wagerAmount: challengeData.wagerAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      matchDate: challengeData.matchDate
    };

    mockMatches.push(newMatch);
    
    toast({
      title: "Challenge Sent!",
      description: `${opponent?.fullName} has been challenged to a match.`
    });
    
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="bg-gray-800 border-green-700">
            <CardHeader>
              <CardTitle className="text-white">Select Opponent</CardTitle>
              <CardDescription className="text-green-200">
                Choose a club member to challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clubMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setChallengeData({...challengeData, opponentId: member.id});
                    setStep(2);
                  }}
                  className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{member.fullName}</p>
                      <p className="text-gray-400 text-sm">Handicap: {member.handicap}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{member.credits.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">credits</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        );

      case 2:
        const selectedOpponent = mockUsers.find(u => u.id === challengeData.opponentId);
        
        return (
          <Card className="bg-gray-800 border-green-700">
            <CardHeader>
              <CardTitle className="text-white">Match Details</CardTitle>
              <CardDescription className="text-green-200">
                vs {selectedOpponent?.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-green-200">Match Format</Label>
                <Select value={challengeData.format} onValueChange={(value) => 
                  setChallengeData({...challengeData, format: value})
                }>
                  <SelectTrigger className="bg-gray-700 border-green-600 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-green-600">
                    <SelectItem value="match-play">Match Play</SelectItem>
                    <SelectItem value="stroke-play">Stroke Play</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-green-200">Course</Label>
                <Select value={challengeData.courseId} onValueChange={(value) => 
                  setChallengeData({...challengeData, courseId: value})
                }>
                  <SelectTrigger className="bg-gray-700 border-green-600 text-white">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-green-600">
                    {mockCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.rating}/{course.slope})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-green-200">Wager Amount</Label>
                <Input
                  type="number"
                  min="100"
                  max="1000"
                  step="50"
                  value={challengeData.wagerAmount}
                  onChange={(e) => setChallengeData({...challengeData, wagerAmount: parseInt(e.target.value)})}
                  className="bg-gray-700 border-green-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Range: 100 - 1,000 credits</p>
              </div>

              <div>
                <Label className="text-green-200">Match Date</Label>
                <Input
                  type="date"
                  value={challengeData.matchDate}
                  onChange={(e) => setChallengeData({...challengeData, matchDate: e.target.value})}
                  className="bg-gray-700 border-green-600 text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1 border-green-600 text-green-400 hover:bg-green-900/30"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!challengeData.format || !challengeData.courseId || !challengeData.matchDate}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
                >
                  Send Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-green-400 hover:text-green-300 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {renderStep()}
    </div>
  );
};
