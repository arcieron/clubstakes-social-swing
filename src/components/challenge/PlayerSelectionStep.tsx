import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe } from 'lucide-react';
import { useClubMembers } from '@/hooks/useClubMembers';
import { PlayerSearchInput } from './PlayerSearchInput';
import { SelectedPlayersDisplay } from './SelectedPlayersDisplay';
import { PlayerCard } from './PlayerCard';
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
  const filteredMembers = clubMembers.filter(member => member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || member.id_number.toString().includes(searchTerm));
  const handlePlayerToggle = (playerId: string, teamNumber?: number) => {
    const isSelected = selectedPlayers.some(p => p.id === playerId);
    if (isSelected) {
      onPlayersChange(selectedPlayers.filter(p => p.id !== playerId));
    } else if (selectedPlayers.length < 7) {
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
    onPlayersChange(selectedPlayers.map(p => p.id === playerId ? {
      ...p,
      team: newTeamNumber
    } : p));
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
    return <Card className="border-primary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading club members...</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Players
        </CardTitle>
        <CardDescription>
          {challengeData.postToFeed ? <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Posting to club feed - invite specific players or let others join
            </div> : `Choose players to challenge directly (${totalPlayers}/${maxPlayers} players)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <SelectedPlayersDisplay user={user} selectedPlayers={selectedPlayers} challengeData={challengeData} clubMembers={clubMembers} onPlayerRemove={playerId => handlePlayerToggle(playerId)} onPlayerTeamChange={handlePlayerTeamChange} onAddOpenSpot={handleAddOpenSpot} openSpots={openSpots} />

        <PlayerSearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredMembers.map(member => {
          const isSelected = selectedPlayers.some(p => p.id === member.id);
          const canSelect = selectedPlayers.length < 7;
          return <PlayerCard key={member.id} member={member} isSelected={isSelected} canSelect={canSelect} onToggle={handlePlayerToggle} />;
        })}
          
          {filteredMembers.length === 0 && !loading && <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No members found matching "{searchTerm}"</p>
              {clubMembers.length === 0 && <p className="text-sm mt-2">No club members found. Make sure profiles are created with the correct club_id.</p>}
            </div>}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 border-primary text-primary hover:bg-primary/10">
            Back
          </Button>
          <Button onClick={onSubmit} disabled={!canProceed} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            {challengeData.postToFeed ? 'Post Challenge' : 'Send Challenge'}
          </Button>
        </div>
      </CardContent>
    </Card>;
};