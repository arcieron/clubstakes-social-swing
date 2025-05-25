
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUsers, mockCourses, mockMatches } from '@/lib/mockData';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChallengeFlowProps {
  user: any;
  onClose: () => void;
}

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [challengeData, setChallengeData] = useState({
    opponentId: '',
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: ''
  });

  const clubMembers = mockUsers.filter(u => u.clubId === user.clubId && u.id !== user.id);
  
  const filteredMembers = clubMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.idNumber.toString().includes(searchTerm)
  );

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
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-primary">Select Opponent</CardTitle>
              <CardDescription>
                Choose a club member to challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or ID number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setChallengeData({...challengeData, opponentId: member.id});
                      setStep(2);
                    }}
                    className="w-full p-4 bg-white hover:bg-primary/5 border border-gray-100 rounded-lg text-left transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-medium">{member.fullName}</p>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">#{member.idNumber}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Handicap: {member.handicap}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">{member.credits.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">credits</p>
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No members found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        const selectedOpponent = mockUsers.find(u => u.id === challengeData.opponentId);
        
        return (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-primary">Match Details</CardTitle>
              <CardDescription>
                vs {selectedOpponent?.fullName} (#{selectedOpponent?.idNumber})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label>Match Format</Label>
                <Select value={challengeData.format} onValueChange={(value) => 
                  setChallengeData({...challengeData, format: value})
                }>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match-play">Match Play</SelectItem>
                    <SelectItem value="stroke-play">Stroke Play</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Course</Label>
                <Select value={challengeData.courseId} onValueChange={(value) => 
                  setChallengeData({...challengeData, courseId: value})
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
                  onChange={(e) => setChallengeData({...challengeData, wagerAmount: parseInt(e.target.value)})}
                  className="bg-white border-gray-200"
                />
                <p className="text-xs text-gray-400 mt-1">Range: 100 - 1,000 credits</p>
              </div>

              <div>
                <Label>Match Date</Label>
                <Input
                  type="date"
                  value={challengeData.matchDate}
                  onChange={(e) => setChallengeData({...challengeData, matchDate: e.target.value})}
                  className="bg-white border-gray-200"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1 border-primary text-primary hover:bg-primary/10"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!challengeData.format || !challengeData.courseId || !challengeData.matchDate}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
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
          className="text-primary hover:text-primary/80 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {renderStep()}
    </div>
  );
};
