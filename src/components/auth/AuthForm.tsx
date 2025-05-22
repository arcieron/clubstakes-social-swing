
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockUsers, mockClubs } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

interface AuthFormProps {
  onLogin: (user: any) => void;
}

export const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    clubInviteCode: '',
    ghinId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign up logic
      const club = mockClubs.find(c => c.inviteCode === formData.clubInviteCode);
      if (!club) {
        toast({ title: "Invalid invite code", variant: "destructive" });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        fullName: formData.fullName,
        clubId: club.id,
        clubName: club.name,
        ghinId: formData.ghinId,
        handicap: Math.floor(Math.random() * 20) + 1, // Mock handicap
        credits: 10000,
        isAdmin: false,
        joinedAt: new Date().toISOString()
      };

      mockUsers.push(newUser);
      onLogin(newUser);
      toast({ title: "Welcome to ClubStakes!" });
    } else {
      // Login logic
      const user = mockUsers.find(u => u.email === formData.email);
      if (user) {
        onLogin(user);
        toast({ title: `Welcome back, ${user.fullName}!` });
      } else {
        toast({ title: "Invalid credentials", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-green-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🏌️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">ClubStakes</CardTitle>
          <CardDescription className="text-green-200">
            {isSignUp ? 'Join your golf club community' : 'Welcome back to the club'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-green-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-700 border-green-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-green-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-gray-700 border-green-600 text-white"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-green-200">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="bg-gray-700 border-green-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clubInviteCode" className="text-green-200">Club Invite Code</Label>
                  <Input
                    id="clubInviteCode"
                    value={formData.clubInviteCode}
                    onChange={(e) => setFormData({...formData, clubInviteCode: e.target.value})}
                    className="bg-gray-700 border-green-600 text-white"
                    placeholder="e.g., RIVIERA2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ghinId" className="text-green-200">GHIN ID</Label>
                  <Input
                    id="ghinId"
                    value={formData.ghinId}
                    onChange={(e) => setFormData({...formData, ghinId: e.target.value})}
                    className="bg-gray-700 border-green-600 text-white"
                    placeholder="12345678"
                    required
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {isSignUp ? 'Join Club' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {isSignUp ? 'Already a member? Sign in' : 'Need an invite? Contact your club admin'}
            </button>
          </div>

          {!isSignUp && (
            <div className="text-center text-xs text-green-300 mt-4">
              <p>Demo: Use any email to login</p>
              <p>Or try: admin@riviera.com (Admin)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
