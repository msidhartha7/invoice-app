-- Enable UUID extension (used by gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────

CREATE TABLE public.profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_subscribed    BOOLEAN     NOT NULL DEFAULT FALSE,
  business_name    TEXT,
  dodo_customer_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.invoices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name    TEXT        NOT NULL,
  items          JSONB       NOT NULL DEFAULT '[]'::JSONB,
  total_amount   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status         TEXT        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'sent', 'paid')),
  payment_link   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- profiles: each user can only see and modify their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- invoices: each user can CRUD only their own invoices
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_own" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update_own" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_delete_own" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- Auto-create profile on signup
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
