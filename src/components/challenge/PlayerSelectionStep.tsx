import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, UserPlus, Globe } from 'lucide-react';

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

interface ProfileData {
  id: string;
  full_name: string;
  id_number: number;
  handicap: number;
  credits: number;
  club_id: string;
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
  const [clubMembers, setClubMembers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubMembers();
  }, [user]);

  const fetchClubMembers = async () => {
    // Try multiple ways to get club_id from user object
    const userClubId = user?.club_id || user?.profile?.club_id;
    
    if (!userClubId) {
      console.log('No club_id found for user:', user);
      setLoading(false);
      return;
    }

    console.log('Fetching club members for club_id:', userClubId);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, id_number, handicap, credits, club_id')
        .eq('club_id', userClubId)
        .neq('id', user.id);

      if (error) {
        console.error('Error fetching club members:', error);
      } else {
        console.log('Fetched club members:', data);
        setClubMembers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchClubMembers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredMembers = clubMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.id_number.toString().includes(searchTerm)
  );

  const handlePlayerToggle = (playerId: string) => {
    const isSelected = selectedPlayers.some(p => p.id === playerId);
    if (isSelected) {
      onPlayersChange(selectedPlayers.filter(p => p.id !== playerId));
    } else if (selectedPlayers.length < 7) {
      onPlayersChange([...selectedPlayers, { id: playerId }]);
    }
  };

  const totalPlayers = selectedPlayers.length + 1;
  const maxPlayers = challengeData.postToFeed ? 8 : 8;
  
  // Determine next action
  const needsTeamAssignment = challengeData.teamFormat === 'teams' && !challengeData.postToFeed && selectedPlayers.length > 0;
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
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Players
        </CardTitle>
        <CardDescription>
          {challengeData.postToFeed ? (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Posting to club feed - invite specific players or let others join
            </div>
          ) : (
            `Choose players to challenge directly (${totalPlayers}/${maxPlayers} players)`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Current Selection Summary */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-primary">Match Participants</p>
            <Badge variant="secondary">{totalPlayers} players</Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-white">
              {user.full_name || user.email} (You)
              {challengeData.teamFormat === 'teams' && ' - Team 1'}
            </Badge>
            {selectedPlayers.map((player, index) => {
              const playerData = clubMembers.find(u => u.id === player.id);
              return (
                <Badge key={player.id} variant="outline" className="flex items-center gap-1">
                  {playerData?.full_name || 'Unknown Player'}
                  {challengeData.teamFormat === 'teams' && ` - Team ${Math.floor(index / 2) + (index % 2 === 0 ? 1 : 2)}`}
                  <button
                    onClick={() => handlePlayerToggle(player.id)}
                    className="text-gray-500 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
            {challengeData.postToFeed && (
              <Badge variant="outline" className="border-dashed border-blue-300 text-blue-600">
                + Open spots for club members
              </Badge>
            )}
          </div>
        </div>

        {/* Search and Player List */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search members by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredMembers.map((member) => {
            const isSelected = selectedPlayers.some(p => p.id === member.id);
            const canSelect = selectedPlayers.length < 7;
            
            return (
              <button
                key={member.id}
                onClick={() => handlePlayerToggle(member.id)}
                disabled={!canSelect && !isSelected}
                className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : canSelect 
                      ? 'bg-white hover:bg-primary/5 border-gray-100 hover:border-primary/30' 
                      : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isSelected ? '✓' : <UserPlus className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-medium">{member.full_name}</p>
                        <Badge variant="secondary" className="text-xs">#{member.id_number}</Badge>
                      </div>
                      <p className="text-gray-500 text-sm">Handicap: {member.handicap}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{member.credits.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">credits</p>
                  </div>
                </div>
              </button>
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

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            Back
          </Button>
          <Button 
            onClick={() => needsTeamAssignment ? onNext() : onSubmit()}
            disabled={!canProceed}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {needsTeamAssignment ? 'Next: Assign Teams' : (challengeData.postToFeed ? 'Post Challenge' : 'Send Challenge')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
