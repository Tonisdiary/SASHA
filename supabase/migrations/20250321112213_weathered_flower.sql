/*
  # Add Messaging System

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `type` (text) - 'direct' or 'group'
      - `name` (text) - For group chats
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_room_participants`
      - `room_id` (uuid, references chat_rooms)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `last_read` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, references chat_rooms)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for chat room access and message management
*/

-- Create chat_rooms table
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('direct', 'group')),
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_room_participants table
CREATE TABLE chat_room_participants (
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat room policies
CREATE POLICY "Users can view chat rooms they're in"
  ON chat_rooms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE room_id = chat_rooms.id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Chat room participants policies
CREATE POLICY "Users can view participants in their chat rooms"
  ON chat_room_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants AS crp
    WHERE crp.room_id = chat_room_participants.room_id
    AND crp.user_id = auth.uid()
  ));

CREATE POLICY "Users can join chat rooms"
  ON chat_room_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their last read timestamp"
  ON chat_room_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their chat rooms"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_room_participants
    WHERE room_id = messages.room_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages to their chat rooms"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_room_participants
      WHERE room_id = messages.room_id
      AND user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Function to update chat room's updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET updated_at = now()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat room timestamp on new message
CREATE TRIGGER update_chat_room_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp();

-- Function to create a direct chat room between two users
CREATE OR REPLACE FUNCTION create_direct_chat_room(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  room_id uuid;
BEGIN
  -- Check if a direct chat room already exists between these users
  SELECT cr.id INTO room_id
  FROM chat_rooms cr
  JOIN chat_room_participants crp1 ON cr.id = crp1.room_id
  JOIN chat_room_participants crp2 ON cr.id = crp2.room_id
  WHERE cr.type = 'direct'
  AND ((crp1.user_id = user1_id AND crp2.user_id = user2_id)
    OR (crp1.user_id = user2_id AND crp2.user_id = user1_id))
  LIMIT 1;

  -- If no room exists, create one
  IF room_id IS NULL THEN
    INSERT INTO chat_rooms (type)
    VALUES ('direct')
    RETURNING id INTO room_id;

    INSERT INTO chat_room_participants (room_id, user_id)
    VALUES
      (room_id, user1_id),
      (room_id, user2_id);
  END IF;

  RETURN room_id;
END;
$$ LANGUAGE plpgsql;