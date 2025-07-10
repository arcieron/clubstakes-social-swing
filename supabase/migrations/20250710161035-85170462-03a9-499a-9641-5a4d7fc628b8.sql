
-- Create holes table to store handicap ratings for each hole on each course
CREATE TABLE public.holes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  hole_number integer NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  par integer NOT NULL CHECK (par >= 3 AND par <= 6),
  handicap_rating integer NOT NULL CHECK (handicap_rating >= 1 AND handicap_rating <= 18),
  yardage integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(course_id, hole_number),
  UNIQUE(course_id, handicap_rating)
);

-- Enable RLS on holes table
ALTER TABLE public.holes ENABLE ROW LEVEL SECURITY;

-- Users can view holes for courses in their club
CREATE POLICY "Users can view holes in their club courses" 
  ON public.holes 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = holes.course_id 
    AND courses.club_id = get_user_club_id()
  ));

-- Admins can manage holes for courses in their club
CREATE POLICY "Admins can manage holes in their club courses" 
  ON public.holes 
  FOR ALL 
  USING (
    is_user_admin() AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = holes.course_id 
      AND courses.club_id = get_user_club_id()
    )
  )
  WITH CHECK (
    is_user_admin() AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = holes.course_id 
      AND courses.club_id = get_user_club_id()
    )
  );
