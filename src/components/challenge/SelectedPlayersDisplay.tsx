import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Player {
  id: string;
  team?: number;
}

interface ChallengeData {
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

interface SelectedPlayersDisplayProps {
  user: any;
  selectedPlayers: Player[];
  challengeData: ChallengeData;
  clubMembers: ProfileData[];
  onPlayerRemove: (playerId: string) => void;
  onPlayerTeamChange?: (playerId: string, teamNumber: number) => void;
  onAddOpenSpot?: (teamNumber?: number) => void;
  openSpots?: {[teamNumber: number]: number};
}

export const SelectedPlayersDisplay = ({ 
  user, 
  selectedPlayers, 
  challengeData, 
  clubMembers, 
  onPlayerRemove,
  onPlayerTeamChange,
  onAddOpenSpot,
  openSpots = {}
}: SelectedPlayersDisplayProps) => {
  const totalOpenSpots = Object.values(openSpots).reduce((sum, count) => sum + count, 0);
  const totalPlayers = selectedPlayers.length + 1 + totalOpenSpots;

  const getTeamColor = (teamNumber: number) => {
    const colors = {
      1: 'bg-blue-500 text-white',
      2: 'bg-red-500 text-white',
      3: 'bg-green-500 text-white',
      4: 'bg-purple-500 text-white',
    };
    return colors[teamNumber as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onPlayerTeamChange) return;
    
    const { draggableId, destination } = result;
    const playerId = draggableId;
    
    // Extract team number from destination droppableId
    let newTeamNumber: number;
    if (destination.droppableId === 'unassigned') {
      newTeamNumber = 0; // 0 means unassigned
    } else {
      newTeamNumber = parseInt(destination.droppableId.replace('team-', ''));
    }
    
    onPlayerTeamChange(playerId, newTeamNumber);
  };

  const renderTeamSection = (teamNumber: number, teamName: string) => {
    const teamPlayers = selectedPlayers.filter(p => p.team === teamNumber);
    const teamOpenSpots = openSpots[teamNumber] || 0;
    const isUserTeam = teamNumber === 1; // User is always on team 1

    return (
      <Droppable droppableId={`team-${teamNumber}`} key={teamNumber}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`border rounded-lg p-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{teamName}</h4>
              <Badge variant="secondary" className="text-xs">
                {(isUserTeam ? 1 : 0) + teamPlayers.length + teamOpenSpots} players
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {/* Show user on team 1 */}
              {isUserTeam && (
                <Badge className={getTeamColor(teamNumber)}>
                  {user.full_name || user.email} (You)
                </Badge>
              )}
              
              {/* Show team players */}
              {teamPlayers.map((player, index) => {
                const playerData = clubMembers.find(u => u.id === player.id);
                return (
                  <Draggable key={player.id} draggableId={player.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-1 ${
                          snapshot.isDragging ? 'opacity-50' : ''
                        }`}
                      >
                        <Badge className={`${getTeamColor(teamNumber)} cursor-move`}>
                          {playerData?.full_name || 'Unknown Player'}
                        </Badge>
                        <button
                          onClick={() => onPlayerRemove(player.id)}
                          className="text-gray-500 hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              
              {/* Show open spots for this team */}
              {Array.from({ length: teamOpenSpots }, (_, index) => (
                <Badge 
                  key={`team-${teamNumber}-spot-${index}`} 
                  variant="outline" 
                  className="border-dashed border-blue-300 text-blue-600"
                >
                  Open Spot
                </Badge>
              ))}
              
              {provided.placeholder}
            </div>
            
            {/* Add open spot button for this team */}
            {challengeData.postToFeed && onAddOpenSpot && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddOpenSpot(teamNumber)}
                className="w-full mt-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add Open Spot to {teamName}
              </Button>
            )}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="bg-primary/5 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-primary">Match Participants</p>
        <Badge variant="secondary">{totalPlayers} players</Badge>
      </div>
      
      {challengeData.teamFormat === 'teams' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-3 mb-4">
            {renderTeamSection(1, 'Team 1')}
            {renderTeamSection(2, 'Team 2')}
            
            {/* Unassigned players */}
            {selectedPlayers.filter(p => !p.team).length > 0 && (
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`border rounded-lg p-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-yellow-100 border-yellow-300' : 'bg-yellow-50'
                    }`}
                  >
                    <h4 className="font-medium text-sm mb-2">Unassigned Players</h4>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {selectedPlayers.filter(p => !p.team).map((player, index) => {
                        const playerData = clubMembers.find(u => u.id === player.id);
                        return (
                          <Draggable key={player.id} draggableId={player.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-1 ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                }`}
                              >
                                <Badge 
                                  variant="outline" 
                                  className="cursor-move border-dashed border-yellow-400 text-yellow-700"
                                >
                                  {playerData?.full_name || 'Unknown Player'}
                                </Badge>
                                <button
                                  onClick={() => onPlayerRemove(player.id)}
                                  className="text-gray-500 hover:text-red-500 ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Individual format - show all players in one section */}
          <Badge className="bg-primary text-white">
            {user.full_name || user.email} (You)
          </Badge>

          {selectedPlayers.map((player) => {
            const playerData = clubMembers.find(u => u.id === player.id);
            return (
              <div key={player.id} className="flex items-center gap-1">
                <Badge variant="outline">
                  {playerData?.full_name || 'Unknown Player'}
                </Badge>
                <button
                  onClick={() => onPlayerRemove(player.id)}
                  className="text-gray-500 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Open spots for individual format */}
          {Array.from({ length: totalOpenSpots }, (_, index) => (
            <Badge key={`open-spot-${index}`} variant="outline" className="border-dashed border-blue-300 text-blue-600">
              Open Spot
            </Badge>
          ))}
        </div>
      )}
      
      {challengeData.postToFeed && onAddOpenSpot && challengeData.teamFormat !== 'teams' && (
        <Button 
          variant="outline" 
          onClick={() => onAddOpenSpot()}
          className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Open Spot for Club Members
        </Button>
      )}
    </div>
  );
};
