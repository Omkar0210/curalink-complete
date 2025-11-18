-- First, insert any missing profiles for existing auth users
INSERT INTO public.profiles (id, name, email, user_type)
SELECT 
  auth.users.id,
  COALESCE(auth.users.raw_user_meta_data->>'name', 'Guest'),
  COALESCE(auth.users.email, CONCAT(auth.users.id, '@anonymous.local')),
  COALESCE(auth.users.raw_user_meta_data->>'user_type', 'patient')
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;