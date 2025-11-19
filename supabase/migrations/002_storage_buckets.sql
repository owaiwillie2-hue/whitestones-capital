-- ===================================================================
-- APPLICATION TABLES & COMPLETE BACKEND SCHEMA
-- ===================================================================
-- This creates all tables needed for the Whitestones Wealth Hub app
-- Run this AFTER 001_initial_schema.sql
-- ===================================================================

-- ===================================================================
-- 1. CREATE PROFILES TABLE (used by app code)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'under_review')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- ===================================================================
-- 2. CREATE ACCOUNT_BALANCES TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.account_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  main_balance NUMERIC(15, 2) DEFAULT 0 CHECK (main_balance >= 0),
  profit_balance NUMERIC(15, 2) DEFAULT 0 CHECK (profit_balance >= 0),
  total_deposited NUMERIC(15, 2) DEFAULT 0 CHECK (total_deposited >= 0),
  total_withdrawn NUMERIC(15, 2) DEFAULT 0 CHECK (total_withdrawn >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_account_balances_user_id ON public.account_balances(user_id);

-- ===================================================================
-- 3. CREATE KYC_DOCUMENTS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_type TEXT CHECK (id_type IN ('passport', 'driver_license', 'national_id', 'government_id')),
  id_number TEXT,
  full_name TEXT,
  date_of_birth DATE,
  country TEXT,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);

-- ===================================================================
-- 4. CREATE WITHDRAWAL_ACCOUNTS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.withdrawal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'crypto', 'paypal')),
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  bic TEXT,
  bank_country TEXT,
  crypto_type TEXT CHECK (crypto_type IN ('bitcoin', 'ethereum', 'litecoin', 'ripple', 'solana', 'usdc', 'tether')),
  crypto_address TEXT,
  crypto_network TEXT,
  paypal_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    CASE
      WHEN account_type = 'bank' THEN account_number IS NOT NULL AND account_holder_name IS NOT NULL
      WHEN account_type = 'crypto' THEN crypto_address IS NOT NULL AND crypto_type IS NOT NULL
      WHEN account_type = 'paypal' THEN paypal_email IS NOT NULL
      ELSE FALSE
    END
  )
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_accounts_user_id ON public.withdrawal_accounts(user_id);

-- ===================================================================
-- 5. CREATE DEPOSITS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  reference_number TEXT,
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);

-- ===================================================================
-- 6. CREATE WITHDRAWALS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  withdrawal_account_id UUID REFERENCES public.withdrawal_accounts(id),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  fee NUMERIC(10, 2) DEFAULT 0,
  net_amount NUMERIC(15, 2) GENERATED ALWAYS AS (amount - fee) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  transaction_reference TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);

-- ===================================================================
-- 7. CREATE ACTIVITY_LOGS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  ip_address TEXT,
  location TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ===================================================================
-- 8. ENABLE RLS
-- ===================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 9. RLS POLICIES - PROFILES
-- ===================================================================

CREATE POLICY "users_read_own_profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins_read_all_profiles" ON public.profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================================
-- 10. RLS POLICIES - ACCOUNT_BALANCES
-- ===================================================================

CREATE POLICY "users_read_own_balances" ON public.account_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins_read_all_balances" ON public.account_balances FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================================
-- 11. RLS POLICIES - KYC_DOCUMENTS
-- ===================================================================

CREATE POLICY "users_read_own_kyc" ON public.kyc_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins_read_all_kyc" ON public.kyc_documents FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_insert_kyc" ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_kyc" ON public.kyc_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- 12. RLS POLICIES - WITHDRAWAL_ACCOUNTS
-- ===================================================================

CREATE POLICY "users_read_own_withdrawal_accounts" ON public.withdrawal_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins_read_all_withdrawal_accounts" ON public.withdrawal_accounts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================================
-- 13. RLS POLICIES - DEPOSITS
-- ===================================================================

CREATE POLICY "users_read_own_deposits" ON public.deposits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins_read_all_deposits" ON public.deposits FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================================
-- 14. RLS POLICIES - ACTIVITY_LOGS
-- ===================================================================

CREATE POLICY "users_read_own_activity" ON public.activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===================================================================
-- STORAGE CONFIGURATION (Manual Steps)
-- ===================================================================
--
-- Create these buckets manually in Supabase Console:
--
-- 1. Go to Storage tab
-- 2. Click "Create Bucket"
-- 3. Name: kyc-documents, Private: YES, Click Create
-- 4. Click "Create Bucket" again
-- 5. Name: deposit-proofs, Private: YES, Click Create
--
-- ===================================================================
