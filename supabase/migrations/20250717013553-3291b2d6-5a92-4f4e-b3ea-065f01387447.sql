
-- Add missing columns to courses table for better course management
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS location TEXT;

-- Create a function to generate the next ID number for a club
CREATE OR REPLACE FUNCTION public.get_next_id_number(club_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(MAX(id_number), 0) + 1 
  FROM public.profiles 
  WHERE club_id = club_uuid;
$$;

-- Create a function to generate unique invite codes
CREATE OR REPLACE FUNCTION public.generate_unique_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.clubs WHERE invite_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Allow admins to create clubs
CREATE POLICY "Super admins can create clubs" 
  ON public.clubs 
  FOR INSERT 
  WITH CHECK (is_user_admin());

-- Allow admins to create courses for any club (if they're super admin)
CREATE POLICY "Super admins can create courses for any club" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (is_user_admin());

-- Allow admins to view all clubs (if they're super admin)
CREATE POLICY "Super admins can view all clubs" 
  ON public.clubs 
  FOR SELECT 
  USING (is_user_admin());

-- Allow admins to create profiles for any club (if they're super admin)
CREATE POLICY "Super admins can create profiles for any club" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (is_user_admin());

-- Allow admins to view all profiles (if they're super admin)
CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_user_admin());
