-- Create registrations table for team-based hackathon signup
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member1_name TEXT,
  member1_email TEXT,
  member1_phone TEXT,
  member1_designation TEXT,
  member2_name TEXT,
  member2_email TEXT,
  member2_phone TEXT,
  member2_designation TEXT,
  member3_name TEXT,
  member3_email TEXT,
  member3_phone TEXT,
  member3_designation TEXT,
  member4_name TEXT,
  member4_email TEXT,
  member4_phone TEXT,
  member4_designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view registrations"
  ON public.registrations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create registrations"
  ON public.registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Users can update their own registrations"
  ON public.registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id);