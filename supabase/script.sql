-- Create type for session status only if it doesn't already exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
      CREATE TYPE session_status AS ENUM ('waiting', 'in_progress', 'complete');
   END IF;
END
$$;

-- Drop tables if they exist (optional, for clean setup)
DROP TABLE IF EXISTS public.session_users CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Create the sessions table
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL, -- Stores the random UUID of the host 
  status session_status NOT NULL DEFAULT 'waiting',
  results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  party_code VARCHAR(6) NOT NULL UNIQUE,
  name TEXT
);

COMMENT ON TABLE public.sessions IS 'Stores information about each movie watch party session.';
COMMENT ON COLUMN public.sessions.host_id IS 'The user ID of the person who created the session (random UUID).';
COMMENT ON COLUMN public.sessions.status IS 'The current status of the session: waiting, in_progress, or complete.';
COMMENT ON COLUMN public.sessions.results IS 'Stores the AI-generated movie recommendations as a JSON object.';
COMMENT ON COLUMN public.sessions.party_code IS 'A unique 6-character code for users to join the session.';

-- Create the session_users table
CREATE TABLE public.session_users (
  user_id UUID PRIMARY KEY, -- Stores the random UUID of the user (PK, no FK to auth.users)
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: Link to Supabase Auth user
  user_name TEXT NOT NULL,
  answers JSONB,
  is_done BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE public.session_users IS 'Links players (by id) to sessions and stores their quiz answers.';
COMMENT ON COLUMN public.session_users.user_id IS 'Random UUID for the user (Primary Key).';
COMMENT ON COLUMN public.session_users.auth_user_id IS 'The Supabase Auth User ID of the player, if authenticated.';
COMMENT ON COLUMN public.session_users.user_name IS 'The display name of the player for this session.';
COMMENT ON COLUMN public.session_users.answers IS 'The player''s answers to the quiz questions.';
COMMENT ON COLUMN public.session_users.is_done IS 'Indicates if the player has completed the quiz.';

CREATE INDEX idx_session_users_session_id ON public.session_users(session_id);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public users can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public users can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Public users can create player rows" ON public.session_users;
DROP POLICY IF EXISTS "Public users can read player rows" ON public.session_users;
DROP POLICY IF EXISTS "Public users can update player rows" ON public.session_users;
DROP POLICY IF EXISTS "Public users can delete player rows" ON public.session_users;

-- Sessions policies 
CREATE POLICY "Public users can create sessions"
  ON public.sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public users can view sessions"
  ON public.sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can update sessions"
  ON public.sessions
  FOR UPDATE
  TO public
  USING (true);

-- Session_users policies (Updated to TO public for anonymous access)
CREATE POLICY "Public users can create player rows"
  ON public.session_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public users can read player rows"
  ON public.session_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public users can update player rows"
  ON public.session_users
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public users can delete player rows"
  ON public.session_users
  FOR DELETE
  TO public
  USING (true);

-- Enable Realtime for sessions table (Required for subscriptions to work)
alter publication supabase_realtime add table public.sessions;