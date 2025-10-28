-- Insert roles for existing test accounts
INSERT INTO public.user_roles (user_id, role) VALUES
  ('84c60e6c-fcd3-41aa-9c95-3fd3a4521a92', 'admin'),
  ('32ca77db-2ea5-408b-94e2-c51d7bbe7a4a', 'parent'),
  ('2fd4ff37-74e6-4916-81d2-99715acf6b62', 'staff'),
  ('70af3a54-cd10-42f3-809b-64779b6ac091', 'tenant')
ON CONFLICT (user_id, role) DO NOTHING;