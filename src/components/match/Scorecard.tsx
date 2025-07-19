
import { useAuth } from '@/hooks/useAuth';
import { ScorecardHeader } from './scorecard/ScorecardHeader';
import { PlayersHeader } from './scorecard/PlayersHeader';
import { ScorecardTable } from './scorecard/ScorecardTable';
import { TeamScorecardTable } from './scorecard/TeamScorecardTable';
import { ActionButtons } from './scorecard/ActionButtons';
import { OnlinePlayersIndicator } from './scorecard/OnlinePlayersIndicator';
import { NineHoleSelector } from './scorecard/NineHoleSelector';
import { useScorecardData } from './scorecard/useScorecardData';
import { useScorecardActions } from './scorecard/useScorecardActions';
import { useState } from 'react';

interface ScorecardProps {
  matchId: string;
  match: any;
  players: any[];
  onSubmitScores: () => void;
}

export const Scorecard = ({ matchId, match, players, onSubmitScores }: ScorecardProps) => {
  const { user } = useAuth();
  const [editingHole, setEditingHole] = useState<{ hole: number; playerId: string } | null>(null);
  const [selectedNine, setSelectedNine] = useState<'front' | 'back'>('front');
  
  const {
    holeScores,
    setHoleScores,
    confirmations,
    fetchConfirmations
  } = useScorecardData(matchId, match, players);

  const {
    loading,
    handleScoreChange,
    calculateTotal,
    calculateToPar,
    getDisplayScore,
    confirmScores
  } = useScorecardActions(matchId, holeScores, setHoleScores, fetchConfirmations, players, confirmations, match, selectedNine);

  const isTeamFormat = match.team_format === 'teams';
  const isScramble = match.format === 'scramble';
  const userConfirmed = confirmations[user?.id || ''];
  const confirmedCount = Object.keys(confirmations).length;
  const totalNeeded = players.length;
  const allConfirmed = confirmedCount === totalNeeded;
  const isNineHoles = match.holes === 9;

  // For scramble, show team-based scorecard
  if (isTeamFormat && isScramble) {
    return (
      <div className="space-y-4 pb-6">
        <ScorecardHeader match={match} isTeamFormat={isTeamFormat} />
        
        <OnlinePlayersIndicator matchId={matchId} players={players} />

        {isNineHoles && (
          <NineHoleSelector 
            selectedNine={selectedNine} 
            onNineChange={setSelectedNine} 
          />
        )}

        {!isNineHoles ? (
          <>
            <TeamScorecardTable
              title="Front 9"
              holeScores={holeScores}
              players={players}
              match={match}
              editingHole={editingHole}
              setEditingHole={setEditingHole}
              handleScoreChange={handleScoreChange}
              getDisplayScore={getDisplayScore}
            />

            <TeamScorecardTable
              title="Back 9"
              holeScores={holeScores}
              players={players}
              match={match}
              editingHole={editingHole}
              setEditingHole={setEditingHole}
              handleScoreChange={handleScoreChange}
              getDisplayScore={getDisplayScore}
              showTotal={true}
              calculateTotal={calculateTotal}
            />
          </>
        ) : (
          <TeamScorecardTable
            title={selectedNine === 'front' ? 'Front 9' : 'Back 9'}
            holeScores={holeScores}
            players={players}
            match={match}
            editingHole={editingHole}
            setEditingHole={setEditingHole}
            handleScoreChange={handleScoreChange}
            getDisplayScore={getDisplayScore}
            showTotal={true}
            calculateTotal={calculateTotal}
            isNineHoles={true}
            selectedNine={selectedNine}
          />
        )}

        <ActionButtons
          userConfirmed={userConfirmed}
          loading={loading}
          confirmedCount={confirmedCount}
          totalNeeded={totalNeeded}
          allConfirmed={allConfirmed}
          onConfirmScores={confirmScores}
        />
      </div>
    );
  }

  // Standard individual scorecard for better-ball and other formats
  return (
    <div className="space-y-4 pb-6">
      <ScorecardHeader match={match} isTeamFormat={isTeamFormat} />
      
      <OnlinePlayersIndicator matchId={matchId} players={players} />

      {isNineHoles && (
        <NineHoleSelector 
          selectedNine={selectedNine} 
          onNineChange={setSelectedNine} 
        />
      )}

      <PlayersHeader 
        players={players}
        confirmations={confirmations}
        calculateTotal={calculateTotal}
        calculateToPar={calculateToPar}
      />

      {!isNineHoles ? (
        <>
          <ScorecardTable
            title="Front 9"
            holeScores={holeScores}
            players={players}
            editingHole={editingHole}
            setEditingHole={setEditingHole}
            handleScoreChange={handleScoreChange}
            getDisplayScore={getDisplayScore}
          />

          <ScorecardTable
            title="Back 9"
            holeScores={holeScores}
            players={players}
            editingHole={editingHole}
            setEditingHole={setEditingHole}
            handleScoreChange={handleScoreChange}
            getDisplayScore={getDisplayScore}
            showTotal={true}
            calculateTotal={calculateTotal}
          />
        </>
      ) : (
        <ScorecardTable
          title={selectedNine === 'front' ? 'Front 9' : 'Back 9'}
          holeScores={holeScores}
          players={players}
          editingHole={editingHole}
          setEditingHole={setEditingHole}
          handleScoreChange={handleScoreChange}
          getDisplayScore={getDisplayScore}
          showTotal={true}
          calculateTotal={calculateTotal}
          isNineHoles={true}
          selectedNine={selectedNine}
        />
      )}

      <ActionButtons
        userConfirmed={userConfirmed}
        loading={loading}
        confirmedCount={confirmedCount}
        totalNeeded={totalNeeded}
        allConfirmed={allConfirmed}
        onConfirmScores={confirmScores}
      />
    </div>
  );
};
