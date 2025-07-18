
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    clubInviteCode: '',
    ghinId: '',
    handicap: '0'
  });

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          club_invite_code: formData.clubInviteCode,
          ghin_id: formData.ghinId,
          handicap: parseInt(formData.handicap) || 0
        });

        if (error) {
          console.error('Sign up error:', error);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Success", description: "Account created successfully! Please check your email to confirm your account." });
        }
      } else {
        console.log('Attempting sign in with:', formData.email);
        const { data, error } = await signIn(formData.email, formData.password);
        
        console.log('Sign in response:', { data, error });
        
        if (error) {
          console.error('Sign in error:', error);
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data?.user) {
          console.log('Sign in successful, redirecting...');
          toast({ title: "Success", description: "Signed in successfully!" });
          // Navigate to home page after successful sign in
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/90 to-primary">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🏌️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">ClubStakes</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {isSignUp ? 'Join your golf club community' : 'Welcome back to the club'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-50 border-gray-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-gray-50 border-gray-200"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clubInviteCode" className="text-gray-700">Club Invite Code</Label>
                  <Input
                    id="clubInviteCode"
                    value={formData.clubInviteCode}
                    onChange={(e) => setFormData({...formData, clubInviteCode: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                    placeholder="e.g., RIVIERA2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ghinId" className="text-gray-700">GHIN ID</Label>
                  <Input
                    id="ghinId"
                    value={formData.ghinId}
                    onChange={(e) => setFormData({...formData, ghinId: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <Label htmlFor="handicap" className="text-gray-700">Handicap</Label>
                  <Input
                    id="handicap"
                    type="number"
                    value={formData.handicap}
                    onChange={(e) => setFormData({...formData, handicap: e.target.value})}
                    className="bg-gray-50 border-gray-200"
                    min="0"
                    max="36"
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Join Club' : 'Sign In')}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {isSignUp ? 'Already a member? Sign in' : 'Need to join? Sign up'}
            </button>
          </div>

          {!isSignUp && (
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Try: club@stake.com (any password)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
