-- Allow authenticated users to insert their own tenant applications
CREATE POLICY "Users can create their own tenant applications" 
ON public.tenants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);