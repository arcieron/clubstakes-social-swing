
import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ChallengeFlow } from '@/components/challenge/ChallengeFlow';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SocialFeed } from '@/components/social/SocialFeed';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Navigation } from '@/components/layout/Navigation';
import { mockUsers, mockClubs } from '@/lib/mockData';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('clubstakes_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('clubstakes_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clubstakes_user');
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary">
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  const renderView = () => {
    if (showChallenge) {
      return <ChallengeFlow user={currentUser} onClose={() => setShowChallenge(false)} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onChallenge={() => setShowChallenge(true)} />;
      case 'leaderboard':
        return <Leaderboard user={currentUser} />;
      case 'feed':
        return <SocialFeed user={currentUser} />;
      case 'admin':
        return <AdminPanel user={currentUser} />;
      default:
        return <Dashboard user={currentUser} onChallenge={() => setShowChallenge(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🏌️</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">ClubStakes</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-primary text-sm font-medium"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1 font-medium">{currentUser.clubName}</p>
        </div>

        {/* Main Content */}
        <div className="pb-20">
          {renderView()}
        </div>

        {/* Bottom Navigation */}
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
          isAdmin={currentUser.isAdmin}
        />
      </div>
    </div>
  );
};

export default Index;
