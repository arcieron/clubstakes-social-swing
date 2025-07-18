
import { useAuth } from '@/hooks/useAuth';
import { useGlobalData } from '@/hooks/useGlobalData';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ChallengeFlow } from '@/components/challenge/ChallengeFlow';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SocialFeed } from '@/components/social/SocialFeed';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { SuperAdminPanel } from '@/components/admin/SuperAdminPanel';
import { MockAccountCreator } from '@/components/dev/MockAccountCreator';
import { Navigation } from '@/components/layout/Navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const {
    user,
    profile,
    loading,
    signOut
  } = useAuth();
  const { refreshData } = useGlobalData();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showChallenge, setShowChallenge] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const handleGetStarted = () => {
    navigate('/signin');
  };

  const handleViewChange = (view: string) => {
    if (view === 'admin' && !profile?.is_admin) {
      return;
    }
    
    // Refresh data when changing views for fresh content
    console.log('View changed to:', view, '- refreshing data');
    refreshData();
    setCurrentView(view);
  };

  // Refresh data when the component mounts or user changes
  useEffect(() => {
    if (user && profile) {
      refreshData();
    }
  }, [user?.id, profile?.id]);

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
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const renderView = () => {
    if (showChallenge) {
      return <ChallengeFlow user={profile} onClose={() => {
        setShowChallenge(false);
        // Refresh data after challenge flow closes
        refreshData();
      }} />;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={profile} onChallenge={() => setShowChallenge(true)} />;
      case 'leaderboard':
        return <Leaderboard user={profile} />;
      case 'feed':
        return <SocialFeed user={profile} />;
      case 'admin':
        if (profile?.is_admin) {
          return <div className="p-4 space-y-6">
              <SuperAdminPanel user={profile} />
              <AdminPanel user={profile} />
              <MockAccountCreator />
            </div>;
        }
        return <Dashboard user={profile} onChallenge={() => setShowChallenge(true)} />;
      default:
        return <Dashboard user={profile} onChallenge={() => setShowChallenge(true)} />;
    }
  };

  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div className="bg-primary border-b border-primary/80 p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/44ebd465-7492-4344-97fc-8f8a5d43c419.png" alt="ClubStakes Logo" className="w-12 h-12 object-contain" />
            </div>
            <button onClick={handleLogout} className="text-white hover:text-green-200 font-medium px-3 py-1.5 text-sm rounded transition-colors hover:bg-white/10">
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20">
          {renderView()}
        </div>

        {/* Bottom Navigation */}
        <Navigation currentView={currentView} onViewChange={handleViewChange} isAdmin={profile.is_admin} />
      </div>
    </div>;
};

export default Index;
