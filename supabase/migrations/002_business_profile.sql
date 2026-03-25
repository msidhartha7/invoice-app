-- Add business profile fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address_line1   TEXT,
  ADD COLUMN IF NOT EXISTS address_line2   TEXT,
  ADD COLUMN IF NOT EXISTS city            TEXT,
  ADD COLUMN IF NOT EXISTS state           TEXT,
  ADD COLUMN IF NOT EXISTS zip             TEXT,
  ADD COLUMN IF NOT EXISTS country         TEXT,
  ADD COLUMN IF NOT EXISTS phone           TEXT,
  ADD COLUMN IF NOT EXISTS business_email  TEXT,
  ADD COLUMN IF NOT EXISTS tax_id          TEXT,
  ADD COLUMN IF NOT EXISTS currency        TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS website         TEXT;
