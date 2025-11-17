-- Allow anonymous users to interact with the app
-- Update profiles table policies for anonymous users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure anonymous users can view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow anonymous users to create collaborations
DROP POLICY IF EXISTS "Users can create collaborations" ON public.collaborations;

CREATE POLICY "Users can create collaborations"
ON public.collaborations
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Allow anonymous users to view their own collaborations
DROP POLICY IF EXISTS "Users can view own collaborations" ON public.collaborations;

CREATE POLICY "Users can view own collaborations"
ON public.collaborations
FOR SELECT
USING (auth.uid() = requester_id);

-- Allow anonymous users to create chat rooms
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Users can create chat rooms"
ON public.chat_rooms
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM collaborations
  WHERE collaborations.id = chat_rooms.collaboration_id
  AND collaborations.requester_id = auth.uid()
));

-- Allow anonymous users to send messages
DROP POLICY IF EXISTS "Room members can send messages" ON public.messages;

CREATE POLICY "Room members can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM chat_rooms
    JOIN collaborations ON chat_rooms.collaboration_id = collaborations.id
    WHERE chat_rooms.id = messages.room_id
    AND collaborations.requester_id = auth.uid()
  )
);