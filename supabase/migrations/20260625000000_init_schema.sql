-- Create schemas
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS logistics;

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Profiles / RBAC
-- ==========================================
CREATE TYPE user_role AS ENUM (
  'pca', 'dg', 'daf', 'comptable', 'facturation',
  'rh', 'logistique', 'chauffeur', 'auditeur'
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'chauffeur',
  department TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Fleet schema
-- ==========================================
CREATE TYPE vehicle_type AS ENUM (
  'camion-citerne', 'porte-conteneur', 'camion-plateau',
  'semi-remorque', 'vehicule-leger', 'engin-special'
);

CREATE TYPE vehicle_status AS ENUM (
  'active', 'immobilized', 'maintenance', 'sold'
);

CREATE TABLE IF NOT EXISTS fleet.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number TEXT NOT NULL UNIQUE,
  type vehicle_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  chassis_number TEXT UNIQUE,
  acquisition_date DATE NOT NULL,
  acquisition_value NUMERIC NOT NULL,
  current_km INTEGER NOT NULL DEFAULT 0,
  status vehicle_status NOT NULL DEFAULT 'active',
  insurance_expiry DATE,
  technical_control_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fleet.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  license_type TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('cdi', 'cdd', 'interim')),
  base_salary NUMERIC NOT NULL,
  hire_date DATE NOT NULL,
  photo_url TEXT,
  vehicle_id UUID REFERENCES fleet.vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fleet.maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES fleet.vehicles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vidange', 'pneus', 'reparation', 'controle-technique', 'autre')),
  date DATE NOT NULL,
  cost NUMERIC NOT NULL,
  provider TEXT,
  description TEXT,
  next_due_date DATE,
  next_due_km INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fleet.fuel_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES fleet.vehicles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES fleet.drivers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  liters NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  km_at_fill INTEGER NOT NULL,
  station TEXT,
  consumption_per_100km NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Logistics schema
-- ==========================================
CREATE TYPE mission_status AS ENUM (
  'planned', 'in_progress', 'completed', 'cancelled'
);

CREATE TABLE IF NOT EXISTS logistics.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  vehicle_id UUID REFERENCES fleet.vehicles(id) NOT NULL,
  driver_id UUID REFERENCES fleet.drivers(id) NOT NULL,
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_at TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_at TIMESTAMP WITH TIME ZONE,
  estimated_distance_km NUMERIC NOT NULL,
  actual_distance_km NUMERIC,
  revenue NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  margin NUMERIC GENERATED ALWAYS AS (revenue - cost) STORED,
  status mission_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Finance schema
-- ==========================================
CREATE TYPE currency_type AS ENUM (
  'XOF', 'EUR', 'USD', 'GBP', 'MAD'
);

CREATE TYPE invoice_status AS ENUM (
  'draft', 'sent', 'paid', 'overdue', 'cancelled'
);

CREATE TABLE IF NOT EXISTS finance.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  credit_limit NUMERIC,
  currency currency_type NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS finance.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES finance.clients(id) NOT NULL,
  mission_id UUID REFERENCES logistics.missions(id) ON DELETE SET NULL,
  amount_ht NUMERIC NOT NULL,
  tva_rate NUMERIC NOT NULL DEFAULT 18.0,
  tva_amount NUMERIC NOT NULL,
  amount_ttc NUMERIC NOT NULL,
  currency currency_type NOT NULL DEFAULT 'XOF',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS finance.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  reference TEXT NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  label TEXT NOT NULL,
  debit NUMERIC NOT NULL DEFAULT 0.0,
  credit NUMERIC NOT NULL DEFAULT 0.0,
  journal_type TEXT NOT NULL CHECK (journal_type IN ('sale', 'purchase', 'bank', 'cash', 'misc')),
  auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- HR schema
-- ==========================================
CREATE TABLE IF NOT EXISTS hr.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  hire_date DATE NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('cdi', 'cdd', 'interim')),
  base_salary NUMERIC NOT NULL,
  currency currency_type NOT NULL DEFAULT 'XOF',
  bank_account TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS hr.payroll_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES hr.employees(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL, -- YYYY-MM
  gross_salary NUMERIC NOT NULL,
  social_charges NUMERIC NOT NULL,
  income_tax NUMERIC NOT NULL,
  net_salary NUMERIC NOT NULL,
  bonuses NUMERIC NOT NULL DEFAULT 0.0,
  advances NUMERIC NOT NULL DEFAULT 0.0,
  deductions NUMERIC NOT NULL DEFAULT 0.0,
  currency currency_type NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL CHECK (status IN ('draft', 'validated', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
