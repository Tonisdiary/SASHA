/*
  # Fix Subjects Table and Policies

  1. Updates
    - Add unique constraint for subject names per user
    - Add indexes for better query performance
    - Update RLS policies for better security
*/

-- Add unique constraint for subject names per user
ALTER TABLE subjects
ADD CONSTRAINT unique_subject_name_per_user UNIQUE (user_id, name);

-- Add indexes for common queries
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_category ON subjects(category);
CREATE INDEX idx_subjects_created_at ON subjects(created_at);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can create own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON subjects;

-- Create improved policies
CREATE POLICY "Users can view own subjects"
ON subjects FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own subjects"
ON subjects FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  name IS NOT NULL AND
  length(name) > 0
);

CREATE POLICY "Users can update own subjects"
ON subjects FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  name IS NOT NULL AND
  length(name) > 0
);

CREATE POLICY "Users can delete own subjects"
ON subjects FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();