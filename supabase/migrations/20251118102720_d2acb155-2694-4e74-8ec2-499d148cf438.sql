-- Drop and recreate user_follows foreign key constraints to reference profiles table
ALTER TABLE public.user_follows DROP CONSTRAINT IF EXISTS user_follows_user_id_fkey;
ALTER TABLE public.user_follows DROP CONSTRAINT IF EXISTS user_follows_expert_id_fkey;

-- Add proper foreign key constraints
ALTER TABLE public.user_follows 
  ADD CONSTRAINT user_follows_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_follows 
  ADD CONSTRAINT user_follows_expert_id_fkey 
  FOREIGN KEY (expert_id) 
  REFERENCES public.experts(id) 
  ON DELETE CASCADE;

-- Similarly fix collaborations foreign key constraint
ALTER TABLE public.collaborations DROP CONSTRAINT IF EXISTS collaborations_requester_id_fkey;

ALTER TABLE public.collaborations
  ADD CONSTRAINT collaborations_requester_id_fkey
  FOREIGN KEY (requester_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;