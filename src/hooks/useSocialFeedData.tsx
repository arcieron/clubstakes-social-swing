
import { useMatches } from '@/hooks/useMatches';

export const useSocialFeedData = (user: any) => {
  const { matches, loading, joinMatch } = useMatches(user);

  const completedMatches = matches.filter(m => 
    m.status === 'completed' || m.status === 'tied'
  );

  const openChallenges = matches.filter(m => 
    m.status === 'open' && 
    m.is_public
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatGameType = (format: string) => {
    switch (format) {
      case 'match-play': return 'Match Play';
      case 'stroke-play': return 'Stroke Play';
      case 'nassau': return 'Nassau';
      case 'scramble': return 'Scramble';
      case 'better-ball': return 'Better Ball';
      case 'skins': return 'Skins';
      default: return format;
    }
  };

  return {
    matches,
    loading,
    joinMatch,
    completedMatches,
    openChallenges,
    formatTimeAgo,
    formatGameType
  };
};
