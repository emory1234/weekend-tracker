-- Migration: Add user authentication support
-- This migration adds user_id columns, updates RLS policies, and creates
-- a trigger to auto-create 10 weekends for new users.

-- Step 1: Add user_id column to weekends table
ALTER TABLE weekends ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Change primary key to composite (user_id, id)
-- This allows each user to have weekends numbered 1-10
ALTER TABLE weekends DROP CONSTRAINT weekends_pkey;
ALTER TABLE weekends ADD PRIMARY KEY (user_id, id);

-- Step 3: Add user_id column to subtasks table
ALTER TABLE subtasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Update subtasks foreign key to reference composite key
ALTER TABLE subtasks DROP CONSTRAINT subtasks_weekend_id_fkey;
ALTER TABLE subtasks ADD CONSTRAINT subtasks_weekend_fkey
  FOREIGN KEY (user_id, weekend_id) REFERENCES weekends(user_id, id) ON DELETE CASCADE;

-- Step 5: Update index for subtasks lookup (include user_id)
DROP INDEX IF EXISTS idx_subtasks_weekend_id;
CREATE INDEX idx_subtasks_user_weekend ON subtasks(user_id, weekend_id);

-- Step 6: Drop existing public RLS policies on weekends
DROP POLICY IF EXISTS "Allow public read on weekends" ON weekends;
DROP POLICY IF EXISTS "Allow public insert on weekends" ON weekends;
DROP POLICY IF EXISTS "Allow public update on weekends" ON weekends;
DROP POLICY IF EXISTS "Allow public delete on weekends" ON weekends;

-- Step 7: Drop existing public RLS policies on subtasks
DROP POLICY IF EXISTS "Allow public read on subtasks" ON subtasks;
DROP POLICY IF EXISTS "Allow public insert on subtasks" ON subtasks;
DROP POLICY IF EXISTS "Allow public update on subtasks" ON subtasks;
DROP POLICY IF EXISTS "Allow public delete on subtasks" ON subtasks;

-- Step 8: Create user-scoped RLS policies for weekends
CREATE POLICY "Users can view own weekends" ON weekends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekends" ON weekends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekends" ON weekends
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekends" ON weekends
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create user-scoped RLS policies for subtasks
CREATE POLICY "Users can view own subtasks" ON subtasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks" ON subtasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks" ON subtasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks" ON subtasks
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Create function to auto-create 10 weekends for new users
CREATE OR REPLACE FUNCTION create_initial_weekends()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO weekends (user_id, id, title, description, is_complete, notes, total_time_seconds)
  VALUES
    (NEW.id, 1, 'Weekend 1', '', false, '', 0),
    (NEW.id, 2, 'Weekend 2', '', false, '', 0),
    (NEW.id, 3, 'Weekend 3', '', false, '', 0),
    (NEW.id, 4, 'Weekend 4', '', false, '', 0),
    (NEW.id, 5, 'Weekend 5', '', false, '', 0),
    (NEW.id, 6, 'Weekend 6', '', false, '', 0),
    (NEW.id, 7, 'Weekend 7', '', false, '', 0),
    (NEW.id, 8, 'Weekend 8', '', false, '', 0),
    (NEW.id, 9, 'Weekend 9', '', false, '', 0),
    (NEW.id, 10, 'Weekend 10', '', false, '', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger on auth.users to auto-create weekends on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_weekends();

-- Step 12: Delete existing seed data (was for public/shared use)
-- New users will get their own weekends via the trigger
DELETE FROM subtasks;
DELETE FROM weekends;
