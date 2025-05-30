
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUsers, mockClubs } from '@/lib/mockData';
import { Users, RotateCcw, Plus, Settings, Copy, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminPanelProps {
  user: any;
}

export const AdminPanel = ({ user }: AdminPanelProps) => {
  const [newInviteCode, setNewInviteCode] = useState('');
  
  const clubMembers = mockUsers.filter(u => u.clubId === user.clubId);
  const userClub = mockClubs.find(c => c.id === user.clubId);

  const generateInviteCode = () => {
    const code = `${userClub?.name.toUpperCase().slice(0, 3)}${new Date().getFullYear()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setNewInviteCode(code);
  };

  const resetSeason = () => {
    // In a real app, this would be a confirmed action
    mockUsers.forEach(u => {
      if (u.clubId === user.clubId) {
        u.credits = 10000;
      }
    });
    toast({ title: "Season Reset", description: "All members reset to 10,000 credits" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Managing {userClub?.name}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-blue-800">{clubMembers.length}</p>
            <p className="text-blue-600 font-medium">Total Members</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">$</span>
            </div>
            <p className="text-3xl font-bold text-green-800">
              {clubMembers.reduce((sum, m) => sum + m.credits, 0).toLocaleString()}
            </p>
            <p className="text-green-600 font-medium">Total Credits</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <Settings className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-purple-800">Active</p>
            <p className="text-purple-600 font-medium">Club Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Member Management */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Member Management
            </CardTitle>
            <CardDescription className="text-gray-500">
              Invite new members and manage existing ones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Current Invite Code */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Current Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  value={userClub?.inviteCode || 'RIVIERA2024'}
                  readOnly
                  className="bg-gray-50 border-gray-200 font-mono text-center"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(userClub?.inviteCode || 'RIVIERA2024')}
                  variant="outline"
                  size="icon"
                  className="border-gray-200 text-primary shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* New Code Generation */}
            {newInviteCode && (
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label className="text-green-700 font-medium">New Code Generated</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInviteCode}
                    readOnly
                    className="bg-white border-green-200 font-mono text-center"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(newInviteCode)}
                    variant="outline"
                    size="icon"
                    className="border-green-200 text-green-700 shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              onClick={generateInviteCode}
              className="w-full bg-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Invite Code
            </Button>
          </CardContent>
        </Card>

        {/* Season Management */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-600" />
              Season Management
            </CardTitle>
            <CardDescription className="text-red-600">
              Dangerous actions that affect all members
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Reset All Credits</h4>
              <p className="text-sm text-gray-600">
                This will reset all member credits to 10,000. This action cannot be undone.
              </p>
            </div>
            <Button 
              onClick={resetSeason}
              variant="destructive"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Season Credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Member List */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-gray-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Club Members ({clubMembers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {clubMembers.map((member, index) => (
              <div 
                key={member.id} 
                className={`flex justify-between items-center p-4 hover:bg-gray-50 transition-colors ${
                  index < clubMembers.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-gray-800 font-medium">{member.fullName}</p>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-mono">
                      #{member.idNumber}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-bold text-lg">{member.credits.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">credits</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
