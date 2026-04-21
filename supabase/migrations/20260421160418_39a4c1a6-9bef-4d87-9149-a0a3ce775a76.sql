
-- 1. Add user_id columns
ALTER TABLE public.weekends ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.subtasks ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. Remove old ownerless seed data (templates without owners)
DELETE FROM public.subtasks WHERE user_id IS NULL;
DELETE FROM public.weekends WHERE user_id IS NULL;

-- 3. Make user_id NOT NULL going forward
ALTER TABLE public.weekends ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.subtasks ALTER COLUMN user_id SET NOT NULL;

-- 4. Change weekends.id to be auto-generated (since each user gets their own set)
CREATE SEQUENCE IF NOT EXISTS public.weekends_id_seq OWNED BY public.weekends.id;
ALTER TABLE public.weekends ALTER COLUMN id SET DEFAULT nextval('public.weekends_id_seq');
SELECT setval('public.weekends_id_seq', COALESCE((SELECT MAX(id) FROM public.weekends), 0) + 1, false);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekends_user_id ON public.weekends(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON public.subtasks(user_id);

-- 6. Drop all old open policies
DROP POLICY IF EXISTS "Allow public delete on weekends" ON public.weekends;
DROP POLICY IF EXISTS "Allow public insert on weekends" ON public.weekends;
DROP POLICY IF EXISTS "Allow public read on weekends" ON public.weekends;
DROP POLICY IF EXISTS "Allow public update on weekends" ON public.weekends;
DROP POLICY IF EXISTS "Allow public delete on subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Allow public insert on subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Allow public read on subtasks" ON public.subtasks;
DROP POLICY IF EXISTS "Allow public update on subtasks" ON public.subtasks;

-- 7. Owner-scoped policies for weekends
CREATE POLICY "Users can view their own weekends"
  ON public.weekends FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekends"
  ON public.weekends FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekends"
  ON public.weekends FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekends"
  ON public.weekends FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 8. Owner-scoped policies for subtasks
CREATE POLICY "Users can view their own subtasks"
  ON public.subtasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subtasks"
  ON public.subtasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subtasks"
  ON public.subtasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subtasks"
  ON public.subtasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 9. Function to seed 10 starter weekends for a new user
CREATE OR REPLACE FUNCTION public.seed_user_weekends()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.weekends (user_id, title, description) VALUES
    (NEW.id, 'Weekend 1', 'Build Your Resolution Tracker'),
    (NEW.id, 'Weekend 2', ''),
    (NEW.id, 'Weekend 3', ''),
    (NEW.id, 'Weekend 4', ''),
    (NEW.id, 'Weekend 5', ''),
    (NEW.id, 'Weekend 6', ''),
    (NEW.id, 'Weekend 7', ''),
    (NEW.id, 'Weekend 8', ''),
    (NEW.id, 'Weekend 9', ''),
    (NEW.id, 'Weekend 10', '');
  RETURN NEW;
END;
$$;

-- 10. Trigger to seed weekends on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_seed_weekends ON auth.users;
CREATE TRIGGER on_auth_user_created_seed_weekends
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_user_weekends();

-- 11. Backfill 10 weekends for any existing users who don't have any
INSERT INTO public.weekends (user_id, title, description)
SELECT u.id, w.title, w.description
FROM auth.users u
CROSS JOIN (VALUES
  ('Weekend 1', 'Build Your Resolution Tracker'),
  ('Weekend 2', ''),
  ('Weekend 3', ''),
  ('Weekend 4', ''),
  ('Weekend 5', ''),
  ('Weekend 6', ''),
  ('Weekend 7', ''),
  ('Weekend 8', ''),
  ('Weekend 9', ''),
  ('Weekend 10', '')
) AS w(title, description)
WHERE NOT EXISTS (SELECT 1 FROM public.weekends WHERE user_id = u.id);
