
-- Create a table to store potential club inquiries
CREATE TABLE public.club_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - allow anyone to insert inquiries
ALTER TABLE public.club_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert club inquiries
CREATE POLICY "Anyone can submit club inquiries" 
  ON public.club_inquiries 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows admins to view all inquiries (for future admin functionality)
CREATE POLICY "Admins can view all club inquiries" 
  ON public.club_inquiries 
  FOR SELECT 
  USING (true);
