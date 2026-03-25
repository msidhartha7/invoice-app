-- Add tax_rate to profiles (used as the default tax % on all invoices)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

-- Add project_name and delivery_fee to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS project_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC NOT NULL DEFAULT 0;
