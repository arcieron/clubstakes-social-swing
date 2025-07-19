
-- Update the matches table RLS policy to allow match participants to update status
-- when transitioning from 'open' to 'in_progress'

-- First, drop the existing restrictive update policy
DROP POLICY IF EXISTS "Match creators can update their matches" ON matches;

-- Create a new policy that allows creators to update their matches
CREATE POLICY "Match creators can update their matches" 
  ON matches 
  FOR UPDATE 
  USING (creator_id = auth.uid());

-- Create a new policy that allows match participants to update status when match becomes full
CREATE POLICY "Match participants can update status to in_progress" 
  ON matches 
  FOR UPDATE 
  USING (
    -- Only allow status updates from 'open' to 'in_progress'
    status = 'open' AND
    -- Only allow if the user is a participant in the match
    EXISTS (
      SELECT 1 FROM match_players 
      WHERE match_id = matches.id AND player_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow changing status to 'in_progress'
    status = 'in_progress' AND
    -- Ensure the match is actually full
    (
      SELECT COUNT(*) FROM match_players 
      WHERE match_id = matches.id
    ) >= COALESCE(max_players, 8)
  );
