-- Fix RLS policies for user_roles table to allow self-registration

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles during registration" ON public.user_roles;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own role during registration
-- This is safe because users can only insert a role for themselves (user_id = auth.uid())
CREATE POLICY "Users can insert their own roles during registration"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);