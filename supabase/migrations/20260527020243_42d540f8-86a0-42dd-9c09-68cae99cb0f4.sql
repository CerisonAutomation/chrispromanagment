
-- Install trigger to auto-create profile + 'user' role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (user_id, email, display_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'display_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Backfill default 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;

-- Grant admin to both existing users
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('381ecfeb-51a7-45e4-91d6-139b71b110cb', 'admin'),
  ('3f44e52d-bdb5-426a-a1e7-6982dca2c8b5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
