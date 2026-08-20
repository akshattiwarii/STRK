-- =========================================================
-- STRK ("Me vs Me") Production Cloud Database Schema
-- Run this in your Supabase SQL Editor (1-Click Setup)
-- =========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'ember',
  freeze_tokens INT DEFAULT 2,
  auto_freeze_enabled BOOLEAN DEFAULT true,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  rank_title TEXT DEFAULT 'Novice',
  sound_enabled BOOLEAN DEFAULT true,
  focus_categories TEXT[] DEFAULT ARRAY['DSA', 'Gym', 'Coding']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Logs Table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  content TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT NOT NULL DEFAULT 'fire',
  energy_level INT DEFAULT 5,
  media_url TEXT,
  goal_id TEXT,
  xp_earned INT DEFAULT 10,
  is_freeze_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_count INT NOT NULL,
  current_count INT DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Items',
  deadline DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE(user_id, badge_id)
);

-- 5. Weekly Reflections Table
CREATE TABLE IF NOT EXISTS public.weekly_reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 10),
  highlight TEXT,
  slip_up TEXT,
  next_week_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast querying across millions of entries
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.weekly_reflections(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for API access (or scoped to user_id)
CREATE POLICY "Allow public read of profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert of profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update of profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read of logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert of logs" ON public.daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update of logs" ON public.daily_logs FOR UPDATE USING (true);
CREATE POLICY "Allow delete of logs" ON public.daily_logs FOR DELETE USING (true);

CREATE POLICY "Allow public read of goals" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Allow insert of goals" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update of goals" ON public.goals FOR UPDATE USING (true);
CREATE POLICY "Allow delete of goals" ON public.goals FOR DELETE USING (true);

CREATE POLICY "Allow public read of reflections" ON public.weekly_reflections FOR SELECT USING (true);
CREATE POLICY "Allow insert of reflections" ON public.weekly_reflections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update of reflections" ON public.weekly_reflections FOR UPDATE USING (true);

CREATE POLICY "Allow public read of badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Allow insert of badges" ON public.user_badges FOR INSERT WITH CHECK (true);
