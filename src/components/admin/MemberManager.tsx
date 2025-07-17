
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Users, Plus, Building, Trophy, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const memberFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  club_id: z.string().min(1, 'Club selection is required'),
  ghin_id: z.string().optional(),
  handicap: z.number().min(0).max(54).optional(),
  credits: z.number().min(0).optional(),
});

interface MemberManagerProps {
  user: any;
}

export const MemberManager = ({ user }: MemberManagerProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');

  const form = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      club_id: '',
      ghin_id: '',
      handicap: 0,
      credits: 10000,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersResponse, clubsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            *,
            clubs(name)
          `),
        supabase
          .from('clubs')
          .select('id, name')
      ]);

      if (membersResponse.error) throw membersResponse.error;
      if (clubsResponse.error) throw clubsResponse.error;

      setMembers(membersResponse.data || []);
      setClubs(clubsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof memberFormSchema>) => {
    try {
      // Get next ID number for the club
      const { data: nextIdNumber, error: idError } = await supabase
        .rpc('get_next_id_number', { club_uuid: values.club_id });

      if (idError) throw idError;

      // Create a temporary user ID for the profile
      const tempUserId = crypto.randomUUID();

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: tempUserId,
          full_name: values.full_name,
          email: values.email,
          club_id: values.club_id,
          id_number: nextIdNumber,
          ghin_id: values.ghin_id,
          handicap: values.handicap || 0,
          credits: values.credits || 10000,
        });

      if (error) throw error;

      toast({ title: "Success", description: "Member created successfully" });
      form.reset();
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating member:', error);
      toast({ title: "Error", description: "Failed to create member", variant: "destructive" });
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.id_number.toString().includes(searchTerm);
    const matchesClub = selectedClub === 'all' || member.club_id === selectedClub;
    return matchesSearch && matchesClub;
  });

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Member Management</h3>
            <p className="text-gray-500">Create and manage club members</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Member</DialogTitle>
                <DialogDescription>
                  Add a new member to a club
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="club_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a club" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clubs.map((club) => (
                              <SelectItem key={club.id} value={club.id}>
                                {club.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="ghin_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GHIN ID</FormLabel>
                          <FormControl>
                            <Input placeholder="GHIN ID..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="handicap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handicap</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="54"
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Credits</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Member</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{member.full_name}</h4>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-mono">
                        #{member.id_number}
                      </span>
                      {member.is_admin && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{member.email}</span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {member.clubs?.name}
                      </span>
                      {member.ghin_id && (
                        <span>GHIN: {member.ghin_id}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Handicap</p>
                      <p className="font-medium flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        {member.handicap || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Credits</p>
                      <p className="font-bold text-green-600">
                        {(member.credits || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm || selectedClub !== 'all' ? 'No members match your filters' : 'No members found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedClub !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first member'
            }
          </p>
        </Card>
      )}
    </div>
  );
};
