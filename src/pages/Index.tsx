
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <div className="max-w-md mx-auto bg-gray-900 min-h-screen relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">ClubStakes</h1>
            <button
              onClick={handleLogout}
              className="text-green-200 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
          <p className="text-green-200 text-sm mt-1">{currentUser.clubName}</p>
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
