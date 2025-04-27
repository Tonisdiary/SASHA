/*
  # Add Study Buddy Feature

  1. New Tables
    - `study_buddies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `latitude` (float)
      - `longitude` (float)
      - `subjects` (text[])
      - `availability` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_available` (boolean)
      - `last_active` (timestamp)

  2. Security
    - Enable RLS on study_buddies table
    - Add policies for authenticated users
*/

CREATE TABLE study_buddies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  subjects text[] DEFAULT '{}',
  availability text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_available boolean DEFAULT true,
  last_active timestamptz DEFAULT now(),
  CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180)
);

-- Enable RLS
ALTER TABLE study_buddies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view nearby study buddies"
  ON study_buddies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own study buddy profile"
  ON study_buddies
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update last_active
CREATE OR REPLACE FUNCTION update_study_buddy_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_active
CREATE TRIGGER update_study_buddy_last_active
  BEFORE UPDATE ON study_buddies
  FOR EACH ROW
  EXECUTE FUNCTION update_study_buddy_last_active();