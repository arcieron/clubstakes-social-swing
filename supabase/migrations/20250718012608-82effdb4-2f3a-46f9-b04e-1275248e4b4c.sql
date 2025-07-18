
-- Add holes and tee_time columns to matches table
ALTER TABLE public.matches 
ADD COLUMN holes integer DEFAULT 18 CHECK (holes IN (9, 18)),
ADD COLUMN tee_time time;

-- Add comment for clarity
COMMENT ON COLUMN public.matches.holes IS 'Number of holes to play (9 or 18)';
COMMENT ON COLUMN public.matches.tee_time IS 'Scheduled tee time for the match';
