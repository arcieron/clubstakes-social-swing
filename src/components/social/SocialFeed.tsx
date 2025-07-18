
import { toast } from '@/hooks/use-toast';
import { useSocialFeedData } from '@/hooks/useSocialFeedData';
import { FeedHeader } from './FeedHeader';
import { OpenChallengesSection } from './OpenChallengesSection';
import { RecentResultsSection } from './RecentResultsSection';

interface SocialFeedProps {
  user: any;
}

export const SocialFeed = ({ user }: SocialFeedProps) => {
  const {
    loading,
    joinMatch,
    completedMatches,
    openChallenges,
    formatTimeAgo,
    formatGameType
  } = useSocialFeedData(user);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading club feed...</p>
        </div>
      </div>
    );
  }

  const handleJoinChallenge = async (matchId: string, wagerAmount: number) => {
    console.log('Joining challenge from social feed:', matchId);
    
    const success = await joinMatch(matchId);
    if (success) {
      toast({
        title: "Joined Challenge!",
        description: "You've successfully joined the challenge. Check your Active Matches tab to see if the match is ready to start."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to join the challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <FeedHeader clubName={user.clubs?.name} />

      <OpenChallengesSection 
        openChallenges={openChallenges}
        user={user}
        onJoinChallenge={handleJoinChallenge}
        formatGameType={formatGameType}
      />

      <RecentResultsSection 
        completedMatches={completedMatches}
        formatGameType={formatGameType}
        formatTimeAgo={formatTimeAgo}
      />
    </div>
  );
};
