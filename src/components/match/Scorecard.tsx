
import { useAuth } from '@/hooks/useAuth';
import { ScorecardHeader } from './scorecard/ScorecardHeader';
import { PlayersHeader } from './scorecard/PlayersHeader';
import { ScorecardTable } from './scorecard/ScorecardTable';
import { ActionButtons } from './scorecard/ActionButtons';
import { useScorecardData } from './scorecard/useScorecardData';
import { useScorecardActions } from './scorecard/useScorecardActions';

interface ScorecardProps {
  matchId: string;
  match: any;
  players: any[];
  onSubmitScores: () => void;
}

export const Scorecard = ({ matchId, match, players, onSubmitScores }: ScorecardProps) => {
  const { user } = useAuth();
  
  const {
    holeScores,
    setHoleScores,
    confirmations,
    fetchConfirmations
  } = useScorecardData(matchId, match, players);

  const {
    editingHole,
    setEditingHole,
    loading,
    handleScoreChange,
    calculateTotal,
    calculateToPar,
    getDisplayScore,
    confirmScores
  } = useScorecardActions(matchId, holeScores, setHoleScores, fetchConfirmations, players);

  const isTeamFormat = match.team_format === 'teams';
  const userConfirmed = confirmations[user?.id || ''];
  const confirmedCount = Object.keys(confirmations).length;
  const totalNeeded = players.length;
  const allConfirmed = confirmedCount === totalNeeded;

  return (
    <div className="space-y-4 pb-6">
      <ScorecardHeader match={match} isTeamFormat={isTeamFormat} />

      <PlayersHeader 
        players={players}
        confirmations={confirmations}
        calculateTotal={calculateTotal}
        calculateToPar={calculateToPar}
      />

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

      <ActionButtons
        userConfirmed={userConfirmed}
        loading={loading}
        confirmedCount={confirmedCount}
        totalNeeded={totalNeeded}
        allConfirmed={allConfirmed}
        onConfirmScores={confirmScores}
        onSubmitScores={onSubmitScores}
      />
    </div>
  );
};
