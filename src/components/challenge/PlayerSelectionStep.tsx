
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe } from 'lucide-react';
import { useClubMembers } from '@/hooks/useClubMembers';
import { PlayerSearchInput } from './PlayerSearchInput';
import { SelectedPlayersDisplay } from './SelectedPlayersDisplay';
import { PlayerCard } from './PlayerCard';
import { toast } from '@/hooks/use-toast';

interface Player {
  id: string;
  team?: number;
}

interface ChallengeData {
  format: string;
  courseId: string;
  wagerAmount: number;
  matchDate: string;
  teamFormat: string;
  postToFeed: boolean;
}

interface PlayerSelectionStepProps {
  user: any;
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
  challengeData: ChallengeData;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const PlayerSelectionStep = ({
  user,
  selectedPlayers,
  onPlayersChange,
  challengeData,
  onBack,
  onNext,
  onSubmit
}: PlayerSelectionStepProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openSpots, setOpenSpots] = useState<{
    [teamNumber: number]: number;
  }>({});
  const {
    clubMembers,
    loading
  } = useClubMembers(user);

  const filteredMembers = clubMembers.filter(member => 
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.id_number.toString().includes(searchTerm)
  );

  const handlePlayerToggle = (playerId: string, teamNumber?: number) => {
    const isSelected = selectedPlayers.some(p => p.id === playerId);
    
    if (isSelected) {
      onPlayersChange(selectedPlayers.filter(p => p.id !== playerId));
    } else if (selectedPlayers.length < 7) {
      // Check if player has enough credits
      const player = clubMembers.find(m => m.id === playerId);
      if (player) {
        const playerCredits = player.credits || 0;
        if (playerCredits < challengeData.wagerAmount) {
          toast({
            title: "Insufficient Credits",
            description: `${player.full_name} needs ${challengeData.wagerAmount.toLocaleString()} credits to join this challenge. They have ${playerCredits.toLocaleString()} credits.`,
            variant: "destructive"
          });
          return;
        }
      }

      const newPlayer: Player = {
        id: playerId
      };
      if (challengeData.teamFormat === 'teams' && teamNumber) {
        newPlayer.team = teamNumber;
      }
      onPlayersChange([...selectedPlayers, newPlayer]);
    }
  };

  const handlePlayerTeamChange = (playerId: string, newTeamNumber: number) => {
    onPlayersChange(selectedPlayers.map(p => 
      p.id === playerId ? { ...p, team: newTeamNumber } : p
    ));
  };

  const handleAddOpenSpot = (teamNumber?: number) => {
    if (teamNumber && challengeData.teamFormat === 'teams') {
      setOpenSpots(prev => ({
        ...prev,
        [teamNumber]: (prev[teamNumber] || 0) + 1
      }));
    } else {
      // For individual format, add to team 1 or general
      setOpenSpots(prev => ({
        ...prev,
        1: (prev[1] || 0) + 1
      }));
    }
  };

  const totalOpenSpots = Object.values(openSpots).reduce((sum, count) => sum + count, 0);
  const totalPlayers = selectedPlayers.length + 1 + totalOpenSpots;
  const maxPlayers = 8;
  const canProceed = challengeData.postToFeed || selectedPlayers.length > 0;

  if (loading) {
    return (
      <Card className="border-primary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading club members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10 pb-4">
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <SelectedPlayersDisplay 
          user={user} 
          selectedPlayers={selectedPlayers} 
          challengeData={challengeData} 
          clubMembers={clubMembers} 
          onPlayerRemove={playerId => handlePlayerToggle(playerId)} 
          onPlayerTeamChange={handlePlayerTeamChange} 
          onAddOpenSpot={handleAddOpenSpot} 
          openSpots={openSpots} 
        />

        <PlayerSearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredMembers.map(member => {
            const isSelected = selectedPlayers.some(p => p.id === member.id);
            const canSelect = selectedPlayers.length < 7;
            const hasEnoughCredits = (member.credits || 0) >= challengeData.wagerAmount;
            
            return (
              <div key={member.id} className="relative">
                <PlayerCard 
                  member={member} 
                  isSelected={isSelected} 
                  canSelect={canSelect && hasEnoughCredits} 
                  onToggle={handlePlayerToggle} 
                />
                {!hasEnoughCredits && !isSelected && (
                  <div className="absolute inset-0 bg-gray-100/80 rounded-lg flex items-center justify-center">
                    <div className="text-center p-2">
                      <p className="text-sm text-red-600 font-medium">Insufficient Credits</p>
                      <p className="text-xs text-gray-600">
                        Needs {challengeData.wagerAmount.toLocaleString()}, has {(member.credits || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No members found matching "{searchTerm}"</p>
              {clubMembers.length === 0 && (
                <p className="text-sm mt-2">No club members found. Make sure profiles are created with the correct club_id.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1 border-primary text-primary hover:bg-primary/10">
            Back
          </Button>
          <Button onClick={onSubmit} disabled={!canProceed} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            {challengeData.postToFeed ? 'Post Challenge' : 'Send Challenge'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

