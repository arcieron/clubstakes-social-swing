
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, RotateCcw, Plus, Copy, Calendar, DollarSign, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminPanelProps {
  user: any;
}

export const AdminPanel = ({ user }: AdminPanelProps) => {
  const [newInviteCode, setNewInviteCode] = useState('');
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);
  const [daysLeft] = useState(180); // This could be calculated from season end date

  useEffect(() => {
    fetchClubMembers();
  }, [user.club_id]);

  const fetchClubMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_id', user.club_id);

      if (error) throw error;
      
      setClubMembers(data || []);
      const credits = (data || []).reduce((sum, member) => sum + (member.credits || 0), 0);
      setTotalCredits(credits);
    } catch (error) {
      console.error('Error fetching club members:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    const code = `${user.clubs?.name?.toUpperCase().slice(0, 3) || 'CLB'}${new Date().getFullYear()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ invite_code: code })
        .eq('id', user.club_id);

      if (error) throw error;
      
      setNewInviteCode(code);
      toast({ title: "New invite code generated", description: code });
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast({ title: "Error", description: "Failed to generate invite code", variant: "destructive" });
    }
  };

  const resetSeason = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: 10000 })
        .eq('club_id', user.club_id);

      if (error) throw error;
      
      await fetchClubMembers();
      toast({ title: "Season Reset", description: "All members reset to 10,000 credits" });
    } catch (error) {
      console.error('Error resetting season:', error);
      toast({ title: "Error", description: "Failed to reset season", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header matching rankings/feed tabs */}
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
          <div className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl font-light">
              <Settings className="w-6 h-6 text-accent" />
              Admin Panel
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 mt-1">
              Managing {user.clubs?.name}
            </CardDescription>
          </div>
        </div>
      </Card>

      {/* Stats tiles - horizontal layout like home page */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{clubMembers.length}</p>
            <p className="text-gray-500 text-sm font-medium">Members</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{totalCredits.toLocaleString()}</p>
            <p className="text-gray-500 text-sm font-medium">Total Credits</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{daysLeft}</p>
            <p className="text-gray-500 text-sm font-medium">Days Left</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  value={user.clubs?.invite_code || 'Loading...'}
                  readOnly
                  className="bg-gray-50 border-gray-200 font-mono text-center"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(user.clubs?.invite_code || '')}
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
                    <p className="text-gray-800 font-medium">{member.full_name}</p>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-mono">
                      #{member.id_number}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-bold text-lg">{(member.credits || 0).toLocaleString()}</p>
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
