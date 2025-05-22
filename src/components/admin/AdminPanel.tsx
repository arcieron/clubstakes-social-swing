
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUsers, mockClubs } from '@/lib/mockData';
import { Users, RotateCcw, Plus, Settings } from 'lucide-react';
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
    <div className="p-4 space-y-6">
      <Card className="bg-gray-800 border-green-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Settings className="w-6 h-6" />
            Admin Panel
          </CardTitle>
          <CardDescription className="text-green-200">
            Manage {userClub?.name}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Club Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-green-700">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{clubMembers.length}</p>
            <p className="text-gray-400 text-sm">Members</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-green-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {clubMembers.reduce((sum, m) => sum + m.credits, 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">Total Credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Code Generator */}
      <Card className="bg-gray-800 border-green-700">
        <CardHeader>
          <CardTitle className="text-white">Generate Invite Code</CardTitle>
          <CardDescription className="text-green-200">
            Create new invite codes for members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-green-200">Current Code</Label>
            <div className="flex gap-2">
              <Input
                value={userClub?.inviteCode || 'RIVIERA2024'}
                readOnly
                className="bg-gray-700 border-green-600 text-white"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(userClub?.inviteCode || 'RIVIERA2024')}
                variant="outline"
                className="border-green-600 text-green-400"
              >
                Copy
              </Button>
            </div>
          </div>
          
          {newInviteCode && (
            <div>
              <Label className="text-green-200">New Code Generated</Label>
              <div className="flex gap-2">
                <Input
                  value={newInviteCode}
                  readOnly
                  className="bg-gray-700 border-green-600 text-white"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(newInviteCode)}
                  variant="outline"
                  className="border-green-600 text-green-400"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            onClick={generateInviteCode}
            className="w-full bg-gradient-to-r from-green-600 to-green-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Code
          </Button>
        </CardContent>
      </Card>

      {/* Member List */}
      <Card className="bg-gray-800 border-green-700">
        <CardHeader>
          <CardTitle className="text-white">Club Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clubMembers.map((member) => (
            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">{member.fullName}</p>
                <p className="text-gray-400 text-sm">{member.email}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{member.credits.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">credits</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Season Reset */}
      <Card className="bg-gray-800 border-red-700">
        <CardHeader>
          <CardTitle className="text-white">Season Management</CardTitle>
          <CardDescription className="text-red-200">
            Reset all member credits to 10,000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={resetSeason}
            variant="destructive"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Season
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
