
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users, UserPlus } from 'lucide-react';

const mockUsers = [
  {
    email: 'john.smith@riviera.com',
    password: 'password123',
    fullName: 'John Smith',
    clubInviteCode: 'RIVIERA2024',
    ghinId: '12345678',
    handicap: 8
  },
  {
    email: 'mike.johnson@riviera.com',
    password: 'password123',
    fullName: 'Mike Johnson',
    clubInviteCode: 'RIVIERA2024',
    ghinId: '23456789',
    handicap: 12
  },
  {
    email: 'sarah.davis@riviera.com',
    password: 'password123',
    fullName: 'Sarah Davis',
    clubInviteCode: 'RIVIERA2024',
    ghinId: '34567890',
    handicap: 6
  },
  {
    email: 'tom.wilson@riviera.com',
    password: 'password123',
    fullName: 'Tom Wilson',
    clubInviteCode: 'RIVIERA2024',
    ghinId: '45678901',
    handicap: 15
  },
  {
    email: 'robert.garcia@pebble.com',
    password: 'password123',
    fullName: 'Robert Garcia',
    clubInviteCode: 'PEBBLE2024',
    ghinId: '56789012',
    handicap: 4
  },
  {
    email: 'admin@riviera.com',
    password: 'admin123',
    fullName: 'Riviera Admin',
    clubInviteCode: 'RIVIERA2024',
    ghinId: '99999999',
    handicap: 10
  }
];

export const MockAccountCreator = () => {
  const [loading, setLoading] = useState(false);
  const [selectedClub, setSelectedClub] = useState('RIVIERA2024');
  const { signUp } = useAuth();

  const createMockAccount = async (user: typeof mockUsers[0]) => {
    try {
      const { error } = await signUp(user.email, user.password, {
        full_name: user.fullName,
        club_invite_code: user.clubInviteCode,
        ghin_id: user.ghinId,
        handicap: user.handicap
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({ 
            title: "Account exists", 
            description: `${user.fullName} is already registered`,
            variant: "default"
          });
        } else {
          toast({ 
            title: "Error", 
            description: error.message, 
            variant: "destructive" 
          });
        }
      } else {
        toast({ 
          title: "Success", 
          description: `Created account for ${user.fullName}` 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const createAllAccounts = async () => {
    setLoading(true);
    const clubUsers = mockUsers.filter(user => user.clubInviteCode === selectedClub);
    
    for (const user of clubUsers) {
      await createMockAccount(user);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  const clubUsers = mockUsers.filter(user => user.clubInviteCode === selectedClub);

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Mock Account Creator (Development Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Club</Label>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RIVIERA2024">Riviera Country Club</SelectItem>
              <SelectItem value="PEBBLE2024">Pebble Beach Golf Links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Available Mock Users for {selectedClub === 'RIVIERA2024' ? 'Riviera' : 'Pebble Beach'}</Label>
          {clubUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Handicap: {user.handicap} | GHIN: {user.ghinId}</p>
              </div>
              <Button
                size="sm"
                onClick={() => createMockAccount(user)}
                disabled={loading}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button 
          onClick={createAllAccounts}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Accounts...' : `Create All ${clubUsers.length} Accounts`}
        </Button>

        <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p><strong>Note:</strong> All accounts use simple passwords for testing:</p>
          <p>• Regular users: password123</p>
          <p>• Admin accounts: admin123</p>
          <p>• This component should only be used in development!</p>
        </div>
      </CardContent>
    </Card>
  );
};
