-- Row-Level Security Policies for Multi-Tenant Isolation
-- This file should be run after initial schema migration

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current tenant_id from session
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.tenant_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Allow users to see only their tenant's users
CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Allow insert only with matching tenant_id
CREATE POLICY users_tenant_insert ON users
  FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id());

-- Tenants table - no RLS (managed by application layer)
-- Tenants is the root table, accessed by authenticated admins only

-- Index for better RLS performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
