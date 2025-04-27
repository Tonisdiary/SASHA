/*
  # Enhanced Study Buddy System

  1. Updates to study_buddies table
    - Add learning_style column
    - Add preferred_study_time column
    - Add study_level column
    - Add PostGIS extension for location-based queries

  2. New Functions
    - find_nearby_study_buddies: Find study buddies within a radius
    - calculate_match_score: Calculate AI-based match score
*/

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add new columns to study_buddies table
ALTER TABLE study_buddies
ADD COLUMN learning_style text,
ADD COLUMN preferred_study_time text,
ADD COLUMN study_level integer DEFAULT 1;

-- Create function to find nearby study buddies
CREATE OR REPLACE FUNCTION find_nearby_study_buddies(
  user_latitude float,
  user_longitude float,
  radius_km float
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  latitude float,
  longitude float,
  subjects text[],
  availability text,
  learning_style text,
  preferred_study_time text,
  study_level integer,
  last_active timestamptz,
  distance float,
  username text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sb.id,
    sb.user_id,
    sb.latitude,
    sb.longitude,
    sb.subjects,
    sb.availability,
    sb.learning_style,
    sb.preferred_study_time,
    sb.study_level,
    sb.last_active,
    ST_Distance(
      ST_MakePoint(sb.longitude, sb.latitude)::geography,
      ST_MakePoint(user_longitude, user_latitude)::geography
    ) / 1000 as distance,
    p.username,
    p.avatar_url
  FROM study_buddies sb
  JOIN profiles p ON sb.user_id = p.id
  WHERE 
    sb.is_available = true
    AND sb.last_active >= NOW() - INTERVAL '15 minutes'
    AND ST_DWithin(
      ST_MakePoint(sb.longitude, sb.latitude)::geography,
      ST_MakePoint(user_longitude, user_latitude)::geography,
      radius_km * 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Create study spots table
CREATE TABLE study_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('library', 'cafe', 'study_room')),
  latitude float NOT NULL,
  longitude float NOT NULL,
  description text,
  current_occupancy integer DEFAULT 0,
  max_occupancy integer NOT NULL,
  amenities text[],
  rating float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180)
);

-- Function to find nearby study spots
CREATE OR REPLACE FUNCTION nearby_spots(
  lat float,
  lng float,
  radius_km float
)
RETURNS SETOF study_spots AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM study_spots
  WHERE ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on study_spots
ALTER TABLE study_spots ENABLE ROW LEVEL SECURITY;

-- Create policies for study_spots
CREATE POLICY "Anyone can view study spots"
  ON study_spots FOR SELECT
  TO authenticated
  USING (true);