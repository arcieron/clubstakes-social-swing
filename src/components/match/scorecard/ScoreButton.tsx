
interface ScoreButtonProps {
  score: number;
  onClick: () => void;
}

export const ScoreButton = ({ score, onClick }: ScoreButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 text-center hover:bg-gray-100 rounded flex items-center justify-center"
    >
      {score || '-'}
    </button>
  );
};
