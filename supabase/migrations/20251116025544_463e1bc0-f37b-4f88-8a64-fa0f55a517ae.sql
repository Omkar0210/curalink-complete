-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for basic user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'researcher')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create researchers table for extended researcher profiles
CREATE TABLE public.researchers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT,
  specialization TEXT,
  orcid TEXT,
  research_gate TEXT,
  field_of_research TEXT,
  experience TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create experts table
CREATE TABLE public.experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  institution TEXT NOT NULL,
  country TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  photo TEXT,
  match_score INTEGER DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create clinical_trials table
CREATE TABLE public.clinical_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  phase TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create publications table
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  abstract TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create favourites table
CREATE TABLE public.favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('expert', 'trial', 'publication')),
  item_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reading', 'trials', 'collaboration')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create forums table
CREATE TABLE public.forums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_follows table for tracking expert follows
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, expert_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for researchers
CREATE POLICY "Anyone can view researchers" ON public.researchers FOR SELECT USING (true);
CREATE POLICY "Researchers can update own profile" ON public.researchers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Researchers can insert own profile" ON public.researchers FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for experts (public read)
CREATE POLICY "Anyone can view experts" ON public.experts FOR SELECT USING (true);

-- RLS Policies for clinical_trials (public read)
CREATE POLICY "Anyone can view trials" ON public.clinical_trials FOR SELECT USING (true);

-- RLS Policies for publications (public read)
CREATE POLICY "Anyone can view publications" ON public.publications FOR SELECT USING (true);

-- RLS Policies for favourites
CREATE POLICY "Users can view own favourites" ON public.favourites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favourites" ON public.favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favourites" ON public.favourites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forums
CREATE POLICY "Anyone can view forums" ON public.forums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forums" ON public.forums FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own forums" ON public.forums FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for forum_comments
CREATE POLICY "Anyone can view comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- RLS Policies for collaborations
CREATE POLICY "Users can view own collaborations" ON public.collaborations FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Users can create collaborations" ON public.collaborations FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own collaborations" ON public.collaborations FOR UPDATE USING (auth.uid() = requester_id);

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view rooms for their collaborations" ON public.chat_rooms FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaborations 
    WHERE collaborations.id = chat_rooms.collaboration_id 
    AND collaborations.requester_id = auth.uid()
  )
);
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collaborations 
    WHERE collaborations.id = chat_rooms.collaboration_id 
    AND collaborations.requester_id = auth.uid()
  )
);

-- RLS Policies for messages
CREATE POLICY "Room members can view messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    JOIN public.collaborations ON chat_rooms.collaboration_id = collaborations.id
    WHERE chat_rooms.id = messages.room_id 
    AND collaborations.requester_id = auth.uid()
  )
);
CREATE POLICY "Room members can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    JOIN public.collaborations ON chat_rooms.collaboration_id = collaborations.id
    WHERE chat_rooms.id = messages.room_id 
    AND collaborations.requester_id = auth.uid()
  )
);

-- RLS Policies for user_follows
CREATE POLICY "Users can view own follows" ON public.user_follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'patient')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_researchers BEFORE UPDATE ON public.researchers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_experts BEFORE UPDATE ON public.experts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_trials BEFORE UPDATE ON public.clinical_trials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_publications BEFORE UPDATE ON public.publications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_forums BEFORE UPDATE ON public.forums FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_collaborations BEFORE UPDATE ON public.collaborations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages and chat_rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;