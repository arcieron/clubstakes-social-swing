
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Plus, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  club_id: z.string().min(1, 'Club selection is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  rating: z.number().min(60).max(80),
  slope: z.number().min(55).max(155),
});

interface CourseManagerProps {
  user: any;
}

export const CourseManager = ({ user }: CourseManagerProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',
      club_id: '',
      location: '',
      description: '',
      rating: 72,
      slope: 113,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesResponse, clubsResponse] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            clubs(name)
          `),
        supabase
          .from('clubs')
          .select('id, name')
      ]);

      if (coursesResponse.error) throw coursesResponse.error;
      if (clubsResponse.error) throw clubsResponse.error;

      setCourses(coursesResponse.data || []);
      setClubs(clubsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof courseFormSchema>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          name: values.name,
          club_id: values.club_id,
          location: values.location,
          description: values.description,
          rating: values.rating,
          slope: values.slope,
        });

      if (error) throw error;

      toast({ title: "Success", description: "Course created successfully" });
      form.reset();
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Course Management</h3>
          <p className="text-gray-500">Create and manage golf courses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new golf course to a club
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Rating</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            min="60" 
                            max="80"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slope Rating</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="55" 
                            max="155"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter course description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{course.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {course.clubs?.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {course.location && (
                <p className="text-sm text-gray-600">{course.location}</p>
              )}
              <div className="flex gap-4 text-sm">
                <span>Rating: {course.rating}</span>
                <span>Slope: {course.slope}</span>
              </div>
              {course.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first course</p>
        </Card>
      )}
    </div>
  );
};
