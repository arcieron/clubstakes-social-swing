import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockUsers, mockCourses, mockMatches } from '@/lib/mockData';
import { ArrowLeft, Search, Plus, Minus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChallengeFlowProps {
  user: any;
  onClose: () => void;
}

interface Player {
  id: string;
  team?: number;
}

export const ChallengeFlow = ({ user, onClose }: ChallengeFlowProps) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [challengeData, setChallengeData] = useState({
    format: '',
    courseId: '',
    wagerAmount: 500,
    matchDate: '',
    teamFormat: 'individual' // 'individual' or 'teams'
  });

  const clubMembers = mockUsers.filter(u => u.clubId === user.clubId && u.id !== user.id);
  
  const filteredMembers = clubMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.idNumber.toString().includes(searchTerm)
  );

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === playerId);
      if (isSelected) {
        return prev.filter(p => p.id !== playerId);
      } else if (prev.length < 7) { // Max 7 others + current user = 8 total
        return [...prev, { id: playerId }];
      }
      return prev;
    });
  };

  const assignPlayerToTeam = (playerId: string, teamNumber: number) => {
    setSelectedPlayers(prev =>
      prev.map(p => p.id === playerId ? { ...p, team: teamNumber } : p)
    );
  };

  const getTeamOptions = () => {
    const totalPlayers = selectedPlayers.length + 1; // +1 for current user
    const maxTeams = Math.floor(totalPlayers / 2);
    return Array.from({ length: maxTeams }, (_, i) => i + 1);
  };

  const handleSubmit = () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one other player.",
        variant: "destructive"
      });
      return;
    }

    const course = mockCourses.find(c => c.id === challengeData.courseId);
    
    const newMatch = {
      id: Date.now().toString(),
      players: [
        { id: user.id, team: challengeData.teamFormat === 'teams' ? 1 : undefined },
        ...selectedPlayers
      ],
      format: challengeData.format,
      course: course?.name || '',
      wagerAmount: challengeData.wagerAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      matchDate: challengeData.matchDate,
      teamFormat: challengeData.teamFormat
    };

    // For backward compatibility, still set player1Id and player2Id for 2-player matches
    if (selectedPlayers.length === 1) {
      (newMatch as any).player1Id = user.id;
      (newMatch as any).player2Id = selectedPlayers[0].id;
    }

    mockMatches.push(newMatch);
    
    const playerNames = selectedPlayers.map(p => {
      const player = mockUsers.find(u => u.id === p.id);
      return player?.fullName;
    }).join(', ');
    
    toast({
      title: "Challenge Sent!",
      description: `${playerNames} ${selectedPlayers.length === 1 ? 'has' : 'have'} been challenged to a match.`
    });
    
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-primary">Select Players</CardTitle>
              <CardDescription>
                Choose 1-7 club members to challenge (2-8 players total)
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

              {selectedPlayers.length > 0 && (
                <div className="bg-primary/5 p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">
                    Selected Players ({selectedPlayers.length + 1}/8):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                      {user.fullName} (You)
                    </span>
                    {selectedPlayers.map(player => {
                      const playerData = mockUsers.find(u => u.id === player.id);
                      return (
                        <span key={player.id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                          {playerData?.fullName}
                          <button
                            onClick={() => handlePlayerToggle(player.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredMembers.map((member) => {
                  const isSelected = selectedPlayers.some(p => p.id === member.id);
                  const canSelect = selectedPlayers.length < 7;
                  
                  return (
                    <button
                      key={member.id}
                      onClick={() => handlePlayerToggle(member.id)}
                      disabled={!canSelect && !isSelected}
                      className={`w-full p-4 border rounded-lg text-left transition-colors shadow-sm ${
                        isSelected 
                          ? 'bg-primary/10 border-primary' 
                          : canSelect 
                            ? 'bg-white hover:bg-primary/5 border-gray-100' 
                            : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-800 font-medium">{member.fullName}</p>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">#{member.idNumber}</span>
                            {isSelected && <span className="text-primary text-xs">✓</span>}
                          </div>
                          <p className="text-gray-400 text-sm">Handicap: {member.handicap}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">{member.credits.toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">credits</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No members found matching "{searchTerm}"
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={selectedPlayers.length === 0}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Next: Game Details
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-primary">Game Details</CardTitle>
              <CardDescription>
                {selectedPlayers.length + 1} players selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label>Game Type</Label>
                <Select value={challengeData.format} onValueChange={(value) => 
                  setChallengeData({...challengeData, format: value})
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

              {(selectedPlayers.length + 1) >= 4 && (
                <div>
                  <Label>Format</Label>
                  <RadioGroup 
                    value={challengeData.teamFormat} 
                    onValueChange={(value) => setChallengeData({...challengeData, teamFormat: value})}
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
                  onClick={() => challengeData.teamFormat === 'teams' ? setStep(3) : handleSubmit()}
                  disabled={!challengeData.format || !challengeData.courseId || !challengeData.matchDate}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {challengeData.teamFormat === 'teams' ? 'Next: Teams' : 'Send Challenge'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        const teamOptions = getTeamOptions();
        
        return (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-primary">Assign Teams</CardTitle>
              <CardDescription>
                Assign players to teams (max {teamOptions.length} teams)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                {/* Current user */}
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary">{user.fullName} (You)</p>
                      <p className="text-sm text-gray-500">Handicap: {user.handicap}</p>
                    </div>
                    <Select defaultValue="1">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teamOptions.map(team => (
                          <SelectItem key={team} value={team.toString()}>Team {team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Other players */}
                {selectedPlayers.map(player => {
                  const playerData = mockUsers.find(u => u.id === player.id);
                  return (
                    <div key={player.id} className="p-3 bg-white border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{playerData?.fullName}</p>
                          <p className="text-sm text-gray-500">Handicap: {playerData?.handicap}</p>
                        </div>
                        <Select 
                          value={player.team?.toString() || ""} 
                          onValueChange={(value) => assignPlayerToTeam(player.id, parseInt(value))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamOptions.map(team => (
                              <SelectItem key={team} value={team.toString()}>Team {team}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="flex-1 border-primary text-primary hover:bg-primary/10"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
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
