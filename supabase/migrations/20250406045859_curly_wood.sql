/*
  # Add Profile Creation Trigger and Fix Foreign Keys

  1. Updates
    - Add trigger function to create profiles for new users
    - Add trigger to auth.users table
    - Ensure proper foreign key relationships
    - Add email column to profiles table

  2. Changes
    - Create handle_new_user() function
    - Create on_auth_user_created trigger
    - Add email column to profiles
    - Verify foreign key constraints
*/

-- Add email column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify and fix foreign key relationships
DO $$ 
BEGIN
  -- Verify profiles foreign key in subjects table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'subjects_user_id_fkey'
  ) THEN
    ALTER TABLE subjects
    ADD CONSTRAINT subjects_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;

  -- Verify profiles foreign key in study_sessions table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'study_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE study_sessions
    ADD CONSTRAINT study_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;

  -- Verify profiles foreign key in study_materials table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'study_materials_user_id_fkey'
  ) THEN
    ALTER TABLE study_materials
    ADD CONSTRAINT study_materials_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;

  -- Verify profiles foreign key in study_buddies table
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'study_buddies_user_id_fkey'
  ) THEN
    ALTER TABLE study_buddies
    ADD CONSTRAINT study_buddies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes for foreign keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'subjects' 
    AND indexname = 'idx_subjects_user_id'
  ) THEN
    CREATE INDEX idx_subjects_user_id ON subjects(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'study_sessions' 
    AND indexname = 'idx_study_sessions_user_id'
  ) THEN
    CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'study_materials' 
    AND indexname = 'idx_study_materials_user_id'
  ) THEN
    CREATE INDEX idx_study_materials_user_id ON study_materials(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'study_buddies' 
    AND indexname = 'idx_study_buddies_user_id'
  ) THEN
    CREATE INDEX idx_study_buddies_user_id ON study_buddies(user_id);
  END IF;
END $$;