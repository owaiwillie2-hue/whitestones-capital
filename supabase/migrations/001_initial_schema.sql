-- ===================================================================
-- SUPABASE BACKEND SETUP FOR FINANCIAL WEB APP
-- ===================================================================
-- Complete SQL schema for KYC, deposits, withdrawals, and admin dashboard
-- Run this in Supabase SQL Editor (under "SQL" tab)
--
-- Prerequisites:
-- 1. Supabase project created
-- 2. Authentication enabled (JWT-based)
-- 3. Storage buckets created (see separate guide)
--
-- ===================================================================

-- ===================================================================
-- 1. CREATE USERS TABLE (extends auth.users)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'under_review')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_kyc_status ON public.users(kyc_status);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- ===================================================================
-- 2. CREATE KYC_VERIFICATIONS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'driver_license', 'national_id', 'government_id')),
  id_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  country TEXT NOT NULL,
  
  -- Document URLs (stored in Supabase Storage)
  front_id_url TEXT,
  back_id_url TEXT,
  selfie_url TEXT,
  
  -- Verification Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Admin Notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)  -- One KYC per user
);

-- Add indexes
CREATE INDEX idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(status);
CREATE INDEX idx_kyc_created_at ON public.kyc_verifications(created_at);

-- ===================================================================
-- 3. CREATE WITHDRAWAL_ACCOUNTS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.withdrawal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Account Type
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'crypto', 'paypal')),
  
  -- Bank Account Details
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  bic TEXT,
  bank_country TEXT,
  
  -- Crypto Account Details
  crypto_type TEXT CHECK (crypto_type IN ('bitcoin', 'ethereum', 'litecoin', 'ripple', 'solana', 'usdc', 'tether')),
  crypto_address TEXT,
  crypto_network TEXT,
  
  -- PayPal Account Details
  paypal_email TEXT,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (
    CASE
      WHEN account_type = 'bank' THEN account_number IS NOT NULL AND account_holder_name IS NOT NULL
      WHEN account_type = 'crypto' THEN crypto_address IS NOT NULL AND crypto_type IS NOT NULL
      WHEN account_type = 'paypal' THEN paypal_email IS NOT NULL
      ELSE FALSE
    END
  )
);

-- Add indexes
CREATE INDEX idx_withdrawal_accounts_user_id ON public.withdrawal_accounts(user_id);
CREATE INDEX idx_withdrawal_accounts_account_type ON public.withdrawal_accounts(account_type);
CREATE INDEX idx_withdrawal_accounts_is_active ON public.withdrawal_accounts(is_active);

-- ===================================================================
-- 4. CREATE DEPOSITS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Deposit Details
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF')),
  
  -- Payment Method
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'crypto', 'wire')),
  reference_number TEXT,
  
  -- Proof of Deposit
  proof_image_url TEXT,
  
  -- Status & Admin Info
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_deposits_created_at ON public.deposits(created_at);
CREATE INDEX idx_deposits_payment_method ON public.deposits(payment_method);

-- ===================================================================
-- 5. CREATE WITHDRAWALS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  withdrawal_account_id UUID NOT NULL REFERENCES public.withdrawal_accounts(id),
  
  -- Withdrawal Details
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  fee NUMERIC(10, 2) DEFAULT 0 CHECK (fee >= 0),
  net_amount NUMERIC(15, 2) GENERATED ALWAYS AS (amount - fee) STORED,
  
  -- Status & Admin Info
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Transaction Reference
  transaction_reference TEXT,
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON public.withdrawals(requested_at);
CREATE INDEX idx_withdrawals_withdrawal_account_id ON public.withdrawals(withdrawal_account_id);

-- ===================================================================
-- 6. CREATE ACTIVITY_LOGS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Activity Details
  action TEXT NOT NULL,
  description TEXT,
  
  -- Device & Location
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  ip_address TEXT,
  location TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

-- ===================================================================
-- 7. CREATE TRANSACTIONS TABLE (for dashboard analytics)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Transaction Type
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fee', 'interest')),
  
  -- Amount Details
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Related Records
  deposit_id UUID REFERENCES public.deposits(id),
  withdrawal_id UUID REFERENCES public.withdrawals(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- ===================================================================
-- 8. CREATE DEPOSIT_PAYMENT_METHODS TABLE
-- ===================================================================

-- Drop existing policies first (prevents foreign key constraint errors)
DROP POLICY IF EXISTS "authenticated_read_active_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_read_all_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_insert_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_update_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_delete_payment_methods" ON public.deposit_payment_methods;

-- Drop old table if exists
DROP TABLE IF EXISTS public.deposit_payment_methods CASCADE;

-- Create fresh table
CREATE TABLE public.deposit_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Payment Method Type
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'bitcoin', 'ethereum', 'crypto_other', 'credit_card')),
  
  -- Display Name
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Bank Transfer Details
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  bic TEXT,
  bank_country TEXT,
  
  -- Crypto Details
  crypto_address TEXT,
  crypto_network TEXT,
  
  -- QR Code (stored in Supabase Storage)
  qr_code_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Admin Info
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_deposit_payment_methods_payment_method ON public.deposit_payment_methods(payment_method);
CREATE INDEX idx_deposit_payment_methods_is_active ON public.deposit_payment_methods(is_active);
CREATE INDEX idx_deposit_payment_methods_created_by ON public.deposit_payment_methods(created_by);

-- ===================================================================
-- 9. CREATE ADMIN LOGS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Action Details
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);

-- ===================================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 10. CREATE RLS POLICIES - USERS TABLE
-- ===================================================================

-- Users can read their own record
CREATE POLICY "users_read_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "admins_read_all_users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own name and phone
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- ===================================================================
-- 11. CREATE RLS POLICIES - KYC_VERIFICATIONS TABLE
-- ===================================================================

-- Users can read their own KYC
CREATE POLICY "users_read_own_kyc"
  ON public.kyc_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all KYC records
CREATE POLICY "admins_read_all_kyc"
  ON public.kyc_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own KYC
CREATE POLICY "users_insert_own_kyc"
  ON public.kyc_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own KYC (status: pending only)
CREATE POLICY "users_update_own_kyc"
  ON public.kyc_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can update KYC status
CREATE POLICY "admins_update_kyc"
  ON public.kyc_verifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================================
-- 12. CREATE RLS POLICIES - WITHDRAWAL_ACCOUNTS TABLE
-- ===================================================================

-- Users can read their own accounts
CREATE POLICY "users_read_own_withdrawal_accounts"
  ON public.withdrawal_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all withdrawal accounts
CREATE POLICY "admins_read_all_withdrawal_accounts"
  ON public.withdrawal_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own accounts
CREATE POLICY "users_insert_own_withdrawal_accounts"
  ON public.withdrawal_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "users_update_own_withdrawal_accounts"
  ON public.withdrawal_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "users_delete_own_withdrawal_accounts"
  ON public.withdrawal_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===================================================================
-- 13. CREATE RLS POLICIES - DEPOSITS TABLE
-- ===================================================================

-- Users can read their own deposits
CREATE POLICY "users_read_own_deposits"
  ON public.deposits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all deposits
CREATE POLICY "admins_read_all_deposits"
  ON public.deposits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own deposits
CREATE POLICY "users_insert_own_deposits"
  ON public.deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can update deposit status
CREATE POLICY "admins_update_deposits"
  ON public.deposits
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================================
-- 13.5 CREATE RLS POLICIES - DEPOSIT_PAYMENT_METHODS TABLE
-- ===================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "authenticated_read_active_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_read_all_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_insert_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_update_payment_methods" ON public.deposit_payment_methods;
DROP POLICY IF EXISTS "admins_delete_payment_methods" ON public.deposit_payment_methods;

-- Everyone can read active payment methods
CREATE POLICY "authenticated_read_active_payment_methods"
  ON public.deposit_payment_methods
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Admins can read all payment methods (active and inactive)
CREATE POLICY "admins_read_all_payment_methods"
  ON public.deposit_payment_methods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert payment methods
CREATE POLICY "admins_insert_payment_methods"
  ON public.deposit_payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update payment methods
CREATE POLICY "admins_update_payment_methods"
  ON public.deposit_payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete payment methods
CREATE POLICY "admins_delete_payment_methods"
  ON public.deposit_payment_methods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================================
-- 14. CREATE RLS POLICIES - WITHDRAWALS TABLE
-- ===================================================================

-- Users can read their own withdrawals
CREATE POLICY "users_read_own_withdrawals"
  ON public.withdrawals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all withdrawals
CREATE POLICY "admins_read_all_withdrawals"
  ON public.withdrawals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own withdrawals
CREATE POLICY "users_insert_own_withdrawals"
  ON public.withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can update withdrawals
CREATE POLICY "admins_update_withdrawals"
  ON public.withdrawals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================================
-- 15. CREATE RLS POLICIES - ACTIVITY_LOGS TABLE
-- ===================================================================

-- Users can read their own activity
CREATE POLICY "users_read_own_activity"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all activity
CREATE POLICY "admins_read_all_activity"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert activity logs
CREATE POLICY "authenticated_insert_activity"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- 16. CREATE RLS POLICIES - TRANSACTIONS TABLE
-- ===================================================================

-- Users can read their own transactions
CREATE POLICY "users_read_own_transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all transactions
CREATE POLICY "admins_read_all_transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert transactions
CREATE POLICY "authenticated_insert_transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- 17. CREATE RLS POLICIES - ADMIN_LOGS TABLE
-- ===================================================================

-- Only admins can read admin logs
CREATE POLICY "admins_read_admin_logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert admin logs
CREATE POLICY "admins_insert_admin_logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================================
-- 18. CREATE HELPFUL VIEWS FOR DASHBOARD
-- ===================================================================

-- Admin Dashboard: Summary Statistics
CREATE OR REPLACE VIEW public.admin_dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM public.users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM public.users WHERE kyc_status = 'approved') as kyc_approved_users,
  (SELECT COUNT(*) FROM public.kyc_verifications WHERE status = 'pending') as pending_kyc,
  (SELECT COUNT(*) FROM public.deposits WHERE status = 'pending') as pending_deposits,
  (SELECT COUNT(*) FROM public.withdrawals WHERE status = 'pending') as pending_withdrawals,
  (SELECT COALESCE(SUM(amount), 0) FROM public.deposits WHERE status = 'completed') as total_deposits,
  (SELECT COALESCE(SUM(amount), 0) FROM public.withdrawals WHERE status = 'completed') as total_withdrawals;

-- Verify policies are applied
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.admin_dashboard_summary TO authenticated;

-- ===================================================================
-- END OF SCHEMA SETUP
-- ===================================================================
-- All tables, indexes, RLS policies, and views created successfully!
-- Next steps:
-- 1. Create storage buckets (see separate guide)
-- 2. Configure storage policies (see separate guide)
-- 3. Test RLS policies with authenticated users
-- 4. Deploy application with API client
