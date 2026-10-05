-- =========================================================================
-- BharathVoice AI — Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Citizen Profiles Table
CREATE TABLE IF NOT EXISTS public.citizen_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    preferred_language TEXT DEFAULT 'te',
    state TEXT,
    education_level TEXT,
    occupation TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations Table
CREATE TABLE IF NOT EXISTS public.citizen_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous',
    title TEXT DEFAULT 'New conversation',
    language TEXT DEFAULT 'en',
    message_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.citizen_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT REFERENCES public.citizen_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved / Bookmarked Schemes Table
CREATE TABLE IF NOT EXISTS public.citizen_saved_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    scheme_key TEXT NOT NULL,
    scheme_title TEXT NOT NULL,
    category TEXT,
    official_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with permissive public policies for client access
ALTER TABLE public.citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_saved_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on citizen_profiles" ON public.citizen_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on citizen_conversations" ON public.citizen_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on citizen_messages" ON public.citizen_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on citizen_saved_schemes" ON public.citizen_saved_schemes FOR ALL USING (true) WITH CHECK (true);
