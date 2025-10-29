-- Create parent-child relationships table
CREATE TABLE IF NOT EXISTS public.parent_child_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  student_tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, student_tenant_id)
);

-- Enable RLS
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- Parents can view their own relationships
CREATE POLICY "Parents can view their children"
  ON public.parent_child_relationships
  FOR SELECT
  USING (auth.uid() = parent_user_id);

-- Admins can manage all relationships
CREATE POLICY "Admins can manage relationships"
  ON public.parent_child_relationships
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Parents can view their children's tenant data
CREATE POLICY "Parents can view their children's tenant data"
  ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_relationships
      WHERE parent_child_relationships.student_tenant_id = tenants.id
        AND parent_child_relationships.parent_user_id = auth.uid()
    )
  );

-- Parents can view payments for their children
CREATE POLICY "Parents can view their children's payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      JOIN public.tenants t ON t.id = pcr.student_tenant_id
      WHERE t.id = payments.tenant_id
        AND pcr.parent_user_id = auth.uid()
    )
  );