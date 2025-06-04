import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ChallengeFlow } from '@/components/challenge/ChallengeFlow';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SocialFeed } from '@/components/social/SocialFeed';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { MockAccountCreator } from '@/components/dev/MockAccountCreator';
import { Navigation } from '@/components/layout/Navigation';
import { useState } from 'react';
const Index = () => {
  const {
    user,
    profile,
    loading,
    signOut
  } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showChallenge, setShowChallenge] = useState(false);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg">🏌️</span>
          </div>
          <p>Loading...</p>
        </div>
      </div>;
  }
  if (!user || !profile) {
    return <AuthPage />;
  }
  const renderView = () => {
    if (showChallenge) {
      return <ChallengeFlow user={profile} onClose={() => setShowChallenge(false)} />;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={profile} onChallenge={() => setShowChallenge(true)} />;
      case 'leaderboard':
        return <Leaderboard user={profile} />;
      case 'feed':
        return <SocialFeed user={profile} />;
      case 'admin':
        return <div className="p-4 space-y-6">
            <AdminPanel user={profile} />
            <MockAccountCreator />
          </div>;
      default:
        return <Dashboard user={profile} onChallenge={() => setShowChallenge(true)} />;
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div className="bg-green-600 border-b border-green-700 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white">
                <img src="/lovable-uploads/44ebd465-7492-4344-97fc-8f8a5d43c419.png" alt="ClubStakes Logo" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-white">
            </h1>
            </div>
            <button onClick={signOut} className="text-white hover:text-green-200 text-sm font-medium">
              Logout
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1 font-medium">{profile.clubs?.name}</p>
        </div>

        {/* Main Content */}
        <div className="pb-20">
          {renderView()}
        </div>

        {/* Bottom Navigation */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} isAdmin={profile.is_admin} />
      </div>
    </div>;
};
export default Index;