import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Plus, X, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddPlayersToMatchProps {
  matchId: string;
  onPlayersAdded: () => void;
}

export const AddPlayersToMatch = ({ matchId, onPlayersAdded }: AddPlayersToMatchProps) => {
  const { profile } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [currentPlayers, setCurrentPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchCurrentPlayers();
  }, [matchId]);

  const fetchPlayers = async () => {
    try {
      const { data: players } = await supabase
        .from('profiles')
        .select('id, full_name, handicap')
        .eq('club_id', profile?.club_id)
        .order('full_name');

      setAvailablePlayers(players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchCurrentPlayers = async () => {
    try {
      const { data: matchPlayers } = await supabase
        .from('match_players')
        .select(`
          player_id,
          team_number,
          profiles(id, full_name, handicap)
        `)
        .eq('match_id', matchId);

      setCurrentPlayers(matchPlayers || []);
    } catch (error) {
      console.error('Error fetching current players:', error);
    }
  };

  const addPlayer = async (playerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_players')
        .insert({
          match_id: matchId,
          player_id: playerId
        });

      if (error) throw error;

      toast({ title: "Success", description: "Player added to match!" });
      await fetchCurrentPlayers();
      onPlayersAdded();
    } catch (error) {
      console.error('Error adding player:', error);
      toast({ title: "Error", description: "Failed to add player", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removePlayer = async (playerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('match_id', matchId)
        .eq('player_id', playerId);

      if (error) throw error;

      toast({ title: "Success", description: "Player removed from match!" });
      await fetchCurrentPlayers();
      onPlayersAdded();
    } catch (error) {
      console.error('Error removing player:', error);
      toast({ title: "Error", description: "Failed to remove player", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = availablePlayers.filter(player =>
    player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !currentPlayers.some(cp => cp.player_id === player.id)
  );

  const currentPlayerIds = currentPlayers.map(cp => cp.player_id);

  return (
    <div className="space-y-4">
      {/* Current Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Players ({currentPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No players in this match yet</p>
          ) : (
            <div className="space-y-2">
              {currentPlayers.map((player) => (
                <div key={player.player_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{player.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">HCP: {player.profiles.handicap}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePlayer(player.player_id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Players */}
      <Card>
        <CardHeader>
          <CardTitle>Add Players</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {searchTerm ? 'No players found matching your search' : 'All club members are already in this match'}
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <p className="font-medium">{player.full_name}</p>
                    <p className="text-sm text-gray-500">HCP: {player.handicap}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPlayer(player.id)}
                    disabled={loading}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
