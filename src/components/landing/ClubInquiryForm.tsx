
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClubInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClubInquiryForm = ({ isOpen, onClose }: ClubInquiryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clubName: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('club_inquiries')
        .insert({
          club_name: formData.clubName,
          email: formData.email,
          phone: formData.phone || null
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit inquiry. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Thank you for your interest! We'll be in touch soon.",
        });
        setFormData({ clubName: '', email: '', phone: '' });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Started with Pins</DialogTitle>
          <DialogDescription>
            Tell us about your club and we'll get in touch to set up your Pins experience.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clubName">Club Name *</Label>
            <Input
              id="clubName"
              value={formData.clubName}
              onChange={(e) => setFormData({...formData, clubName: e.target.value})}
              placeholder="e.g., Riviera Country Club"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your.email@club.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
