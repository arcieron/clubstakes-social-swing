
import { Trophy, Home, Users, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export const Navigation = ({ currentView, onViewChange, isAdmin }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy },
    { id: 'feed', label: 'Feed', icon: Users },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-800 border-t border-green-700">
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-green-400 bg-green-900/30' 
                  : 'text-gray-400 hover:text-green-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
