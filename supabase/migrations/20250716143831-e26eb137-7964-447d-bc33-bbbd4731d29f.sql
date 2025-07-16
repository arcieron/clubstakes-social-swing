
-- Enable realtime for hole_scores table
ALTER TABLE public.hole_scores REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.hole_scores;

-- Enable realtime for match_confirmations table  
ALTER TABLE public.match_confirmations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.match_confirmations;

-- Enable realtime for matches table to track status changes
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.matches;
