
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
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
              <Settings className="w-6 h-6" />
              Admin Panel
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Manage {userClub?.name}
            </CardDescription>
          </div>
        </div>
      </Card>

      {/* Club Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{clubMembers.length}</p>
            <p className="text-gray-500 text-sm">Members</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {clubMembers.reduce((sum, m) => sum + m.credits, 0).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm">Total Credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Code Generator */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg">Generate Invite Code</CardTitle>
          <CardDescription className="text-gray-500">
            Create new invite codes for members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-700">Current Code</Label>
            <div className="flex gap-2">
              <Input
                value={userClub?.inviteCode || 'RIVIERA2024'}
                readOnly
                className="bg-gray-50 border-gray-200"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(userClub?.inviteCode || 'RIVIERA2024')}
                variant="outline"
                className="border-gray-200 text-primary"
              >
                Copy
              </Button>
            </div>
          </div>
          
          {newInviteCode && (
            <div>
              <Label className="text-gray-700">New Code Generated</Label>
              <div className="flex gap-2">
                <Input
                  value={newInviteCode}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(newInviteCode)}
                  variant="outline"
                  className="border-gray-200 text-primary"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            onClick={generateInviteCode}
            className="w-full bg-primary text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Code
          </Button>
        </CardContent>
      </Card>

      {/* Member List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg">Club Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {clubMembers.map((member) => (
            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-gray-800 font-medium">{member.fullName}</p>
                <p className="text-gray-500 text-sm">{member.email}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-bold">{member.credits.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">credits</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Season Reset */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg">Season Management</CardTitle>
          <CardDescription className="text-red-500">
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
