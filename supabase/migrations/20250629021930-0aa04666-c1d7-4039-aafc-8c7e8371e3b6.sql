
-- Remove the existing check constraint on wager_amount
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_wager_amount_check;

-- Add a new check constraint that allows the range used in the UI (100-1500)
ALTER TABLE public.matches ADD CONSTRAINT matches_wager_amount_check 
CHECK (wager_amount >= 100 AND wager_amount <= 1500);
