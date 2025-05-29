
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/lib/mockData';
import { Search } from 'lucide-react';

interface Player {
  id: string;
  team?: number;
}

interface PlayerSelectionStepProps {
  user: any;
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
  onNext: () => void;
}

export const PlayerSelectionStep = ({ user, selectedPlayers, onPlayersChange, onNext }: PlayerSelectionStepProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clubMembers = mockUsers.filter(u => u.clubId === user.clubId && u.id !== user.id);
  
  const filteredMembers = clubMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.idNumber.toString().includes(searchTerm)
  );

  const handlePlayerToggle = (playerId: string) => {
    const isSelected = selectedPlayers.some(p => p.id === playerId);
    if (isSelected) {
      onPlayersChange(selectedPlayers.filter(p => p.id !== playerId));
    } else if (selectedPlayers.length < 7) { // Max 7 others + current user = 8 total
      onPlayersChange([...selectedPlayers, { id: playerId }]);
    }
  };

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
          onClick={onNext}
          disabled={selectedPlayers.length === 0}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Next: Game Details
        </Button>
      </CardContent>
    </Card>
  );
};
