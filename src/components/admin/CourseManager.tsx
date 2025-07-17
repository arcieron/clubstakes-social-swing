
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CourseForm } from './course/CourseForm';

const holeSchema = z.object({
  par: z.number().min(3).max(6),
  handicap_rating: z.number().min(1).max(18),
  yardage: z.number().nullable(),
});

const courseFormSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  club_id: z.string().min(1, 'Club selection is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  rating: z.number().min(60).max(80),
  slope: z.number().min(55).max(155),
  holes: z.array(holeSchema).length(18, 'All 18 holes must be configured'),
}).refine((data) => {
  const handicaps = data.holes.map(h => h.handicap_rating);
  const uniqueHandicaps = new Set(handicaps);
  return uniqueHandicaps.size === 18 && handicaps.every(h => h >= 1 && h <= 18);
}, {
  message: "All handicap ratings 1-18 must be used exactly once",
  path: ["holes"]
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
      holes: Array.from({ length: 18 }, (_, i) => ({
        par: 4,
        handicap_rating: i + 1,
        yardage: null,
      })),
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
            clubs(name),
            holes(*)
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
      // Create the course first
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          name: values.name,
          club_id: values.club_id,
          location: values.location,
          description: values.description,
          rating: values.rating,
          slope: values.slope,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create all holes for the course
      const holesData = values.holes.map((hole, index) => ({
        course_id: courseData.id,
        hole_number: index + 1,
        par: hole.par,
        handicap_rating: hole.handicap_rating,
        yardage: hole.yardage,
      }));

      const { error: holesError } = await supabase
        .from('holes')
        .insert(holesData);

      if (holesError) throw holesError;

      toast({ title: "Success", description: "Course and holes created successfully" });
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
          <p className="text-gray-500">Create and manage golf courses with hole details</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new golf course with detailed hole information
              </DialogDescription>
            </DialogHeader>
            <CourseForm 
              form={form}
              clubs={clubs}
              onSubmit={onSubmit}
              onCancel={() => setOpen(false)}
            />
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
                <span>Holes: {course.holes?.length || 0}/18</span>
              </div>
              {course.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
              )}
              {course.holes && course.holes.length > 0 && (
                <div className="text-xs text-gray-500">
                  Par: {course.holes.reduce((sum: number, hole: any) => sum + hole.par, 0)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first course with detailed hole information</p>
        </Card>
      )}
    </div>
  );
};
